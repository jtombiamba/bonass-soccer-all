import pytest
from rest_framework import status
from evaluations.models import SkillEvaluation
from players.models import Player


@pytest.mark.django_db
def test_evaluate_list_empty(auth_client, player, eval_round):
    response = auth_client.get("/api/evaluations/evaluate/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data == []


@pytest.mark.django_db
def test_evaluate_create(auth_client, player, eval_round, org):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    other_user = User.objects.create_user(username="other", email="other@test.com", password="pass")
    other_player = Player.objects.create(user=other_user, organization=org, pseudo="OtherPseudo")
    response = auth_client.post(
        "/api/evaluations/evaluate/",
        {
            "evaluated": other_player.id,
            "pace_skill": 70,
            "assist_skill": 80,
            "defensive_skill": 60,
            "dribbling_skill": 75,
            "shooting_skill": 85,
        },
        format="json",
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert SkillEvaluation.objects.filter(evaluator=player, evaluated=other_player).exists()
