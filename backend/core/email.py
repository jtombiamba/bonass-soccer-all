"""
Email utilities for the football management system.
"""
from django.conf import settings
from django.core.mail import send_mail
from players.models import Player
from poll.models import WeeklyPoll


def send_poll_scheduled_email(player: Player, poll: WeeklyPoll) -> bool:
    """
    Send an email to a player informing them that a new poll is open.
    Returns True if the email was sent successfully, False otherwise.
    """
    subject = f"New poll for game on {poll.game.game_date:%A, %d %B %Y}"
    frontend_url = settings.FRONTEND_BASE_URL.rstrip("/")
    poll_url = f"{frontend_url}/polls"

    message = f"""
Hello {player.pseudo},

A new poll for the upcoming Friday game ({poll.game.game_date:%d/%m/%Y}) has been created.

Please indicate whether you will be available by answering the poll at:
{poll_url}

You can answer "Available" or "Not available".

See you on the pitch!

— Your football team manager
"""
    recipient_email = player.user.email
    if not recipient_email:
        return False

    try:
        send_mail(
            subject,
            message.strip(),
            settings.DEFAULT_FROM_EMAIL,
            [recipient_email],
            fail_silently=False,
        )
        return True
    except Exception:
        # Log the error in production
        return False