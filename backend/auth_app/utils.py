"""
Utilities for password reset token generation and validation.
"""
import jwt
from datetime import datetime
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

User = get_user_model()


class PasswordResetToken(AccessToken):
    """
    Custom JWT token for password reset.
    Adds a 'type' claim to differentiate from access tokens.
    """
    token_type = "password_reset"
    lifetime = settings.SIMPLE_JWT.get("PASSWORD_RESET_TOKEN_LIFETIME")

    def __init__(self, token=None, verify=True):
        super().__init__(token, verify)
        if self.payload.get("type") != self.token_type:
            raise InvalidToken("Token type mismatch")


def generate_password_reset_token(user: User) -> str:
    """
    Generate a JWT token for password reset for the given user.
    """
    token = PasswordResetToken()
    token["type"] = token.token_type
    token["user_id"] = user.id
    return str(token)


def validate_password_reset_token(token_string: str) -> User:
    """
    Validate a password reset token and return the associated user.
    Raises TokenError if token is invalid, expired, or of wrong type.
    """
    try:
        token = PasswordResetToken(token_string, verify=True)
        user_id = token["user_id"]
        user = User.objects.get(id=user_id)
        return user
    except (TokenError, InvalidToken, jwt.PyJWTError, User.DoesNotExist) as e:
        raise TokenError("Invalid or expired password reset token") from e