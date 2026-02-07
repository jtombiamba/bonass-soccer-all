"""
Celery tasks: weekly poll launch, monthly evaluation round, Friday code send.
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta

from players.models import Game, Organization
from evaluations.models import EvaluationRound
from evaluations.services import assign_all_organizations
from poll.models import WeeklyPoll
from core.email import send_poll_scheduled_email, send_evaluation_assignment_email, send_distribution_code_email


def next_friday():
    d = timezone.now().date()
    while d.weekday() != 4:  # Friday
        d += timedelta(days=1)
    return d


@shared_task
def launch_weekly_poll():
    """
    Run Monday: create Game for next Friday and a WeeklyPoll for it.
    Single-tenant: use first organization.
    """
    org = Organization.objects.first()
    if not org:
        return
    friday = next_friday()
    if Game.objects.filter(organization=org, game_date=friday).exists():
        return
    game = Game.objects.create(organization=org, game_date=friday, status="pending")
    poll = WeeklyPoll.objects.create(game=game)

    # Notify all players of the organization
    players = org.players.select_related("user").filter(user__email__isnull=False).exclude(user__email="")
    for player in players:
        send_poll_scheduled_email(player, poll)

    return {"game_id": game.id, "game_date": str(friday)}


@shared_task
def launch_monthly_evaluation_round():
    """
    Run 1st of month: create EvaluationRound for current year/month,
    generate evaluation assignments, and notify players by email.
    """
    now = timezone.now()
    round_obj, created = EvaluationRound.objects.get_or_create(year=now.year, month=now.month)

    # Generate assignments for all organizations (single tenant)
    assign_all_organizations()

    # Send email notifications to each player with assignments
    org = Organization.objects.first()
    if org:
        players = org.players.select_related("user").filter(user__email__isnull=False).exclude(user__email="")
        for player in players:
            send_evaluation_assignment_email(player, round_obj)

    return {"year": now.year, "month": now.month, "created": created, "assignments_generated": True}


@shared_task
def wednesday_lock_poll():
    """
    Run Wednesday at noon: lock all polls for the upcoming Friday game,
    confirm or cancel the game based on available players.
    """
    from poll.models import WeeklyPoll
    from poll.services import available_count
    from django.utils import timezone

    friday = next_friday()
    polls = WeeklyPoll.objects.filter(
        game__game_date=friday,
        hard_lock=False
    ).select_related("game")
    locked_count = 0
    for poll in polls:
        poll.hard_lock = True
        poll.is_locked = True
        poll.locked_at = timezone.now()
        poll.save(update_fields=["hard_lock", "is_locked", "locked_at"])

        count = available_count(poll)
        game = poll.game
        if count >= poll.min_players:
            game.status = "confirmed"
            game.confirmed_at = timezone.now()
        else:
            game.status = "cancelled"
        game.save(update_fields=["status", "confirmed_at"])
        locked_count += 1

    return {"locked_count": locked_count, "friday": str(friday)}


@shared_task
def friday_send_distribution_code():
    """
    Run Friday morning: for today's game, assign code and pick random available player.
    In production, also send SMS/email with the code.
    """
    today = timezone.now().date()
    game = Game.objects.filter(game_date=today).first()
    if not game or game.distribution_code or game.status != "confirmed":
        return
    from poll.models import PollResponse
    from players.models import Player
    available = list(PollResponse.objects.filter(poll__game=game, available=True).values_list("player_id", flat=True))
    if not available:
        return
    import secrets
    code = secrets.token_hex(16)
    game.distribution_code = code
    chosen_player_id = secrets.SystemRandom().choice(available)
    game.code_sent_to_player_id = chosen_player_id
    game.save(update_fields=["distribution_code", "code_sent_to_player_id"])
    # Send email to the chosen player
    try:
        player = Player.objects.get(pk=chosen_player_id)
        send_distribution_code_email(player, game, code)
    except Player.DoesNotExist:
        pass
    return {"game_id": game.id, "code_sent_to_player_id": game.code_sent_to_player_id}
