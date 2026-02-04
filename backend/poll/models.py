from django.db import models
from players.models import Player, Game


class WeeklyPoll(models.Model):
    """Weekly poll for a given Friday game."""
    game = models.OneToOneField(Game, on_delete=models.CASCADE, related_name="poll")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "poll_weekly"


class PollResponse(models.Model):
    """Player's answer: available or not for the game."""
    poll = models.ForeignKey(WeeklyPoll, on_delete=models.CASCADE, related_name="responses")
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="poll_responses")
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "poll_response"
        unique_together = [["poll", "player"]]
