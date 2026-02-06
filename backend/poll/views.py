from rest_framework import generics, status
from rest_framework.response import Response

from players.models import Player
from .models import WeeklyPoll, PollResponse
from .serializers import WeeklyPollSerializer, AnswerPollSerializer
from .services import update_poll_lock


def get_current_player(request):
    try:
        return Player.objects.get(user=request.user)
    except Player.DoesNotExist:
        return None


class PollListView(generics.ListAPIView):
    """List polls (e.g. current week)."""
    serializer_class = WeeklyPollSerializer

    def get_queryset(self):
        return WeeklyPoll.objects.all().select_related("game").prefetch_related("responses", "responses__player").order_by("-game__game_date")


class AnswerPollView(generics.GenericAPIView):
    """Answer the current week's poll: available or not."""
    serializer_class = AnswerPollSerializer

    def post(self, request, poll_id):
        player = get_current_player(request)
        if not player:
            return Response({"detail": "Player profile required."}, status=status.HTTP_403_FORBIDDEN)
        serializer = AnswerPollSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            poll = WeeklyPoll.objects.get(pk=poll_id)
        except WeeklyPoll.DoesNotExist:
            return Response({"detail": "Poll not found."}, status=status.HTTP_404_NOT_FOUND)
        if poll.game.organization_id != player.organization_id:
            return Response({"detail": "Not your organization's poll."}, status=status.HTTP_403_FORBIDDEN)
        if poll.is_locked:
            return Response({"detail": "Poll is locked. You cannot change your answer."}, status=status.HTTP_400_BAD_REQUEST)
        obj, created = PollResponse.objects.update_or_create(
            poll=poll, player=player,
            defaults={"available": serializer.validated_data["available"]},
        )
        update_poll_lock(poll)
        return Response({"detail": "Poll answered.", "available": obj.available}, status=status.HTTP_200_OK)
