from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user; can be linked to Player for roommates."""
    email = models.EmailField(unique=True, blank=False)
    phone = models.CharField(max_length=20, blank=True)

    class Meta:
        db_table = "auth_user"
