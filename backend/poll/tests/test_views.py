import pytest
from rest_framework import status
from poll.models import PollResponse


@pytest.mark.django_db
def test_poll_list(auth_client, player, poll):
    response = auth_client.get("/api/polls/")
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_answer_poll(auth_client, player, poll):
    response = auth_client.post(
        f"/api/polls/{poll.id}/answer/",
        {"available": True},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert PollResponse.objects.filter(poll=poll, player=player, available=True).exists()
