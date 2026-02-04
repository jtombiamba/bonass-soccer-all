import pytest
from rest_framework import status
from players.models import Game, PhysicalConditionReport, Team
from poll.models import PollResponse


@pytest.mark.django_db
def test_player_create(auth_client, user, org):
    response = auth_client.post(
        "/api/players/create/",
        {"pseudo": "MyPseudo", "phone": "+456"},
        format="json",
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["pseudo"] == "MyPseudo"


@pytest.mark.django_db
def test_get_games(auth_client, player, game):
    response = auth_client.get("/api/players/games/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1


@pytest.mark.django_db
def test_get_game_details(auth_client, player, game):
    response = auth_client.get(f"/api/players/games/{game.id}/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["game_date"]


@pytest.mark.django_db
def test_submit_physical_condition(auth_client, player, game):
    response = auth_client.post(
        "/api/players/physical-condition/",
        {"game": game.id, "score": 85},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert PhysicalConditionReport.objects.filter(player=player, game=game).exists()


@pytest.mark.django_db
def test_submit_score(auth_client, player, game):
    response = auth_client.post(
        f"/api/players/games/{game.id}/score/",
        {"team_a_goals": 3, "team_b_goals": 2},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK
    game.refresh_from_db()
    assert game.team_a_goals == 3
    assert game.team_b_goals == 2


@pytest.mark.django_db
def test_assign_teams_with_code(auth_client, player, game, poll):
    PollResponse.objects.create(poll=poll, player=player, available=True)
    # Backend assigns code (normally done by cron); we set it manually for test
    import secrets
    code = secrets.token_hex(16)
    game.distribution_code = code
    game.save()
    response = auth_client.post(
        f"/api/players/games/{game.id}/assign-teams/",
        {"code": code},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert Team.objects.filter(game=game).count() == 2
