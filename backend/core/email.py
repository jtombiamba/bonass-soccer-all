"""
Email utilities for the football management system.
"""
from django.conf import settings
from django.core.mail import send_mail
from players.models import Player, Game
from poll.models import WeeklyPoll
from evaluations.models import EvaluationAssignment
from auth_app.models import User


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


def send_distribution_code_email(player: Player, game: Game, code: str) -> bool:
    """
    Send an email to a player with the distribution code for team generation.
    Returns True if the email was sent successfully, False otherwise.
    """
    subject = f"Distribution code for game on {game.game_date:%A, %d %B %Y}"
    frontend_url = settings.FRONTEND_BASE_URL.rstrip("/")
    teams_url = f"{frontend_url}/teams"

    message = f"""
Hello {player.pseudo},

You have been selected to generate teams for the upcoming Friday game ({game.game_date:%d/%m/%Y}).

Your distribution code is: {code}

Please go to the teams page and enter this code to generate teams:
{teams_url}

Only you can generate the teams. Keep this code confidential.

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


def send_evaluation_assignment_email(player: Player, evaluation_round) -> bool:
    """
    Send an email to a player with their monthly evaluation assignments.
    Returns True if the email was sent successfully, False otherwise.
    """
    assignments = EvaluationAssignment.objects.filter(
        round=evaluation_round, evaluator=player
    ).select_related("evaluated")
    if not assignments:
        # No assignments, maybe skip
        return False

    pseudo_list = ", ".join(ass.evaluated.pseudo for ass in assignments)
    subject = f"Monthly player evaluations are open"
    frontend_url = settings.FRONTEND_BASE_URL.rstrip("/")
    eval_url = f"{frontend_url}/evaluations"

    message = f"""
Hello {player.pseudo},

The monthly player evaluation round for {evaluation_round.year}-{evaluation_round.month:02d} is now open.

You have been assigned to evaluate the following players:
{pseudo_list}

Please submit your evaluations at:
{eval_url}

You can evaluate each player on pace, assist, defensive, dribbling, and shooting skills (0–100).

Thank you for helping improve the team!

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


def send_password_reset_email(user: User, token: str) -> bool:
    """
    Send a password reset email to a user with a reset link containing the token.
    Returns True if the email was sent successfully, False otherwise.
    """
    subject = "Password Reset Request"
    frontend_url = settings.FRONTEND_BASE_URL.rstrip("/")
    reset_url = f"{frontend_url}/reset-password?token={token}"

    message = f"""
Hello {user.username},

You have requested to reset your password for the Football Team Management system.

Please click the following link to set a new password:
{reset_url}

If you did not request this password reset, you can safely ignore this email.

This link will expire in 1 hour.

— Your football team manager
"""
    recipient_email = user.email
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