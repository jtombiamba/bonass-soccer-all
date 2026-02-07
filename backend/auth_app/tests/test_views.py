import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
def test_register(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {
            "username": "newuser",
            "email": "new@test.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "New",
            "last_name": "User",
        },
        format="json",
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert User.objects.filter(username="newuser").exists()


@pytest.mark.django_db
def test_token_obtain(user, api_client):
    response = api_client.post(
        "/api/auth/token/",
        {"username": "user1", "password": "testpass123"},
        format="json",
    )
    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_me_requires_auth(api_client):
    response = api_client.get("/api/auth/me/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_me_authenticated(auth_client, user):
    response = auth_client.get("/api/auth/me/")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["username"] == user.username
