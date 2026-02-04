import secrets
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from poll.models import WeeklyPoll, PollResponse
from .models import Organization, Player, Game, Team, PhysicalConditionReport
from .serializers import (
    PlayerSerializer,
    GameSerializer,
    GameListSerializer,
    PhysicalConditionReportSerializer,
    SubmitScoreSerializer,
    AssignCodeAndTeamsSerializer,
)
from .services import compute_final_score, assign_teams_by_weighted_scores


def get_current_player(request):
    try:
        return Player.objects.get(user=request.user)
    except Player.DoesNotExist:
        return None


# --- List players in my org (for evaluation form) ---
class PlayerListView(generics.ListAPIView):
    """List players in my organization (for selecting who to evaluate)."""
    serializer_class = PlayerMinSerializer

    def get_queryset(self):
        player = get_current_player(self.request)
        if not player:
            return Player.objects.none()
        return Player.objects.filter(organization=player.organization).order_by("pseudo")


# --- Player profile (create/update) ---
class PlayerMeView(generics.RetrieveUpdateAPIView):
    """Get or update my player profile (pseudo, phone). Must belong to an org."""
    serializer_class = PlayerSerializer

    def get_object(self):
        return get_current_player(self.request)

    def get_queryset(self):
        p = get_current_player(self.request)
        return Player.objects.filter(pk=p.pk) if p else Player.objects.none()


class PlayerCreateView(generics.CreateAPIView):
    """Create player profile: link user to org with pseudo and phone."""
    serializer_class = PlayerSerializer

    def perform_create(self, serializer):
        player = get_current_player(self.request)
        if player:
            raise ValueError("You already have a player profile.")
        # For single-tenant: use first org or create one
        org = Organization.objects.first()
        if not org:
            org = Organization.objects.create(name="Default Group")
        serializer.save(user=self.request.user, organization=org)


# --- Physical condition (day before game) ---
def create_performance_note(request):
    """Submit physical condition for a game (0-100). Alias: submit_physical_condition."""
    return submit_physical_condition(request)


class SubmitPhysicalConditionView(APIView):
    """POST: submit my physical condition score for a game."""

    def post(self, request):
        player = get_current_player(request)
        if not player:
            return Response({"detail": "Player profile required."}, status=status.HTTP_403_FORBIDDEN)
        serializer = PhysicalConditionReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        game_id = serializer.validated_data["game"].id
        game = Game.objects.get(pk=game_id)
        if game.organization_id != player.organization_id:
            return Response({"detail": "Game not in your organization."}, status=status.HTTP_403_FORBIDDEN)
        obj, _ = PhysicalConditionReport.objects.update_or_create(
            player=player, game=game,
            defaults={"score": serializer.validated_data["score"]},
        )
        return Response(PhysicalConditionReportSerializer(obj).data, status=status.HTTP_200_OK)


def submit_physical_condition(request):
    view = SubmitPhysicalConditionView.as_view()
    return view(request)


# --- Games list and detail ---
class GetGamesView(generics.ListAPIView):
    """List games for my organization."""
    serializer_class = GameListSerializer

    def get_queryset(self):
        player = get_current_player(self.request)
        if not player:
            return Game.objects.none()
        return Game.objects.filter(organization=player.organization).order_by("-game_date")


class GetGameDetailsView(generics.RetrieveAPIView):
    """Game detail with teams."""
    serializer_class = GameSerializer

    def get_queryset(self):
        player = get_current_player(self.request)
        if not player:
            return Game.objects.none()
        return Game.objects.filter(organization=player.organization).prefetch_related("teams", "teams__players")


# --- Submit score (after game) ---
class SubmitScoreView(APIView):
    """POST: set final score for a game (team_a_goals, team_b_goals)."""

    def post(self, request, game_id):
        player = get_current_player(request)
        if not player:
            return Response({"detail": "Player profile required."}, status=status.HTTP_403_FORBIDDEN)
        try:
            game = Game.objects.get(pk=game_id)
        except Game.DoesNotExist:
            return Response({"detail": "Game not found."}, status=status.HTTP_404_NOT_FOUND)
        if game.organization_id != player.organization_id:
            return Response({"detail": "Not your organization."}, status=status.HTTP_403_FORBIDDEN)
        serializer = SubmitScoreSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        game.team_a_goals = serializer.validated_data["team_a_goals"]
        game.team_b_goals = serializer.validated_data["team_b_goals"]
        game.save()
        return Response(GameSerializer(game).data, status=status.HTTP_200_OK)


def submit_score(request, game_id):
    view = SubmitScoreView.as_view()
    return view(request, game_id=game_id)


# --- Assign code and teams (random player gets code; with code, launch distribution) ---
class AssignCodeAndTeamsView(APIView):
    """
    GET: (cron/backend) assign a random code to the game and send code to a random available player.
    POST: (with code) run team distribution for that game.
    """

    def get(self, request, game_id):
        """Backend/cron: assign code and pick random player to send it to."""
        try:
            game = Game.objects.get(pk=game_id)
        except Game.DoesNotExist:
            return Response({"detail": "Game not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            poll = WeeklyPoll.objects.get(game=game)
        except WeeklyPoll.DoesNotExist:
            return Response({"detail": "No poll for this game."}, status=status.HTTP_400_BAD_REQUEST)
        available = PollResponse.objects.filter(poll=poll, available=True).values_list("player_id", flat=True)
        if not available:
            return Response({"detail": "No available players."}, status=status.HTTP_400_BAD_REQUEST)
        code = secrets.token_hex(16)
        game.distribution_code = code
        chosen = secrets.SystemRandom().choice(list(available))
        game.code_sent_to_player_id = chosen
        game.save(update_fields=["distribution_code", "code_sent_to_player_id"])
        # In production: send code via SMS/email to code_sent_to_player
        return Response({
            "detail": "Code assigned.",
            "code_sent_to_player_id": chosen,
            "code": code,  # Only for testing; remove in prod or return only in debug
        }, status=status.HTTP_200_OK)

    def post(self, request, game_id):
        """Launch team distribution using the code (called by the player who received the code)."""
        player = get_current_player(request)
        if not player:
            return Response({"detail": "Player profile required."}, status=status.HTTP_403_FORBIDDEN)
        serializer = AssignCodeAndTeamsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data["code"]
        try:
            game = Game.objects.get(pk=game_id)
        except Game.DoesNotExist:
            return Response({"detail": "Game not found."}, status=status.HTTP_404_NOT_FOUND)
        if game.organization_id != player.organization_id:
            return Response({"detail": "Not your organization."}, status=status.HTTP_403_FORBIDDEN)
        if not code or game.distribution_code != code:
            return Response({"detail": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            poll = WeeklyPoll.objects.get(game=game)
        except WeeklyPoll.DoesNotExist:
            return Response({"detail": "No poll for this game."}, status=status.HTTP_400_BAD_REQUEST)
        available_players = Player.objects.filter(
            id__in=PollResponse.objects.filter(poll=poll, available=True).values_list("player_id", flat=True)
        )
        assign_teams_by_weighted_scores(game, available_players)
        return Response({"detail": "Teams assigned.", "game": GameSerializer(game).data}, status=status.HTTP_200_OK)


def assign_code_and_teams(request, game_id):
    view = AssignCodeAndTeamsView.as_view()
    return view(request, game_id=game_id)


def get_games(request):
    view = GetGamesView.as_view()
    return view(request)


def get_game_details(request, game_id):
    view = GetGameDetailsView.as_view()
    return view(request, game_id=game_id)
