"""
Services for poll locking logic.
"""
from django.utils import timezone
from .models import WeeklyPoll, PollResponse


def available_count(poll: WeeklyPoll) -> int:
    """Return the number of players who have answered 'available'."""
    return PollResponse.objects.filter(poll=poll, available=True).count()


def update_poll_lock(poll: WeeklyPoll) -> None:
    """
    Recalculate lock status based on current available count and max_players.
    If hard_lock is already True, lock status is permanent.
    """
    if poll.hard_lock:
        # Hard lock already set (Wednesday noon). No changes.
        poll.is_locked = True
        poll.locked_by_max = False
        poll.save(update_fields=["is_locked", "locked_by_max"])
        return

    count = available_count(poll)
    if count >= poll.max_players:
        # Reached max capacity → lock
        if not poll.is_locked or not poll.locked_by_max:
            poll.is_locked = True
            poll.locked_by_max = True
            poll.locked_at = timezone.now()
            poll.save(update_fields=["is_locked", "locked_by_max", "locked_at"])
    else:
        # Below max capacity → unlock if locked_by_max
        if poll.locked_by_max:
            poll.is_locked = False
            poll.locked_by_max = False
            poll.save(update_fields=["is_locked", "locked_by_max"])
        # If locked by hard_lock, we would keep locked, but hard_lock is false here
    # Note: is_locked could be True for other reasons (manual lock), we don't change that.