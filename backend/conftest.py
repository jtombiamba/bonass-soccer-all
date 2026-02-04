import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from players.models import Organization, Player, Game
from evaluations.models import EvaluationRound, SkillEvaluation
from poll.models import WeeklyPoll, PollResponse

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def org(db):
    return Organization.objects.create(name="Test Org")


@pytest.fixture
def user(db):
    return User.objects.create_user(username="user1", email="u1@test.com", password="testpass123")


@pytest.fixture
def player(db, org, user):
    return Player.objects.create(user=user, organization=org, pseudo="Pseudo1", phone="+123")


@pytest.fixture
def game(db, org):
    from datetime import date
    from datetime import timedelta
    d = date.today()
    while d.weekday() != 4:
        d += timedelta(days=1)
    return Game.objects.create(organization=org, game_date=d)


@pytest.fixture
def poll(db, game):
    return WeeklyPoll.objects.create(game=game)


@pytest.fixture
def eval_round(db):
    from django.utils import timezone
    now = timezone.now()
    return EvaluationRound.objects.get_or_create(year=now.year, month=now.month)[0]


@pytest.fixture
def auth_client(api_client, user):
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client
