import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Creates a superuser from environment variables if it doesn't exist"

    def handle(self, *args, **options):
        username = os.environ.get("ADMIN_USERNAME")
        password = os.environ.get("ADMIN_PASSWORD")
        email = os.environ.get("ADMIN_EMAIL")

        if not all([username, password, email]):
            self.stdout.write(
                self.style.WARNING(
                    "Missing one or more environment variables: "
                    "ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL. Skipping superuser creation."
                )
            )
            return

        if User.objects.filter(username=username, is_superuser=True).exists():
            self.stdout.write(
                self.style.SUCCESS(f"Superuser '{username}' already exists. Skipping.")
            )
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(
            self.style.SUCCESS(f"Superuser '{username}' created successfully.")
        )