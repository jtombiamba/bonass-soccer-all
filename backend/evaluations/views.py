from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.utils import timezone

from players.models import Player
from .models import EvaluationRound, SkillEvaluation
from .serializers import SkillEvaluationSerializer, SkillEvaluationCreateSerializer, EvaluationRoundSerializer


def get_current_player(request):
    try:
        return Player.objects.get(user=request.user)
    except Player.DoesNotExist:
        return None


def get_current_round():
    now = timezone.now()
    return EvaluationRound.objects.filter(year=now.year, month=now.month).first()


class EvaluateView(generics.ListCreateAPIView):
    """List my evaluations for current round; create evaluation for a peer (up to 5 per round)."""
    def get_serializer_class(self):
        return SkillEvaluationCreateSerializer if self.request.method == "POST" else SkillEvaluationSerializer

    def get_queryset(self):
        player = get_current_player(self.request)
        if not player:
            return SkillEvaluation.objects.none()
        r = get_current_round()
        if not r:
            return SkillEvaluation.objects.none()
        return SkillEvaluation.objects.filter(round=r, evaluator=player).select_related("evaluated", "round")

    def perform_create(self, serializer):
        player = get_current_player(self.request)
        if not player:
            raise ValueError("Player profile required")
        r = get_current_round()
        if not r:
            raise ValueError("No evaluation round for this month")
        count = SkillEvaluation.objects.filter(round=r, evaluator=player).count()
        if count >= 5:
            raise ValidationError("You can evaluate at most 5 players per round.")
        serializer.save(round=r, evaluator=player)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)


class EvaluationRoundsListView(generics.ListAPIView):
    """List evaluation rounds (for UI)."""
    queryset = EvaluationRound.objects.all()
    serializer_class = EvaluationRoundSerializer
