from django.db import models
from django.conf import settings


class Organization(models.Model):
    """Single group of friends (one tenant)."""
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "players_organization"


class Player(models.Model):
    """Player profile: user + org; name, pseudo, phone."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="player")
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="players")
    pseudo = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "players_player"
        unique_together = [["organization", "pseudo"]]

    def __str__(self):
        return f"{self.pseudo} ({self.user.username})"


class Game(models.Model):
    """A Friday game: date, teams, score, distribution code."""
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="games")
    game_date = models.DateField()
    team_a_goals = models.PositiveIntegerField(default=0)
    team_b_goals = models.PositiveIntegerField(default=0)
    distribution_code = models.CharField(max_length=32, blank=True)
    code_sent_to_player = models.ForeignKey(
        Player, null=True, blank=True, on_delete=models.SET_NULL, related_name="codes_received"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "players_game"
        ordering = ["-game_date"]


class Team(models.Model):
    """Team in a game (A or B)."""
    class TeamSide(models.TextChoices):
        A = "A", "Team A"
        B = "B", "Team B"

    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="teams")
    side = models.CharField(max_length=1, choices=TeamSide.choices)
    players = models.ManyToManyField(Player, related_name="team_memberships", blank=True)

    class Meta:
        db_table = "players_team"
        unique_together = [["game", "side"]]


class PhysicalConditionReport(models.Model):
    """Day-before self-assessment of physical condition (0-100)."""
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="physical_reports")
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="physical_reports")
    score = models.PositiveIntegerField()  # 0-100
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "players_physical_condition_report"
        unique_together = [["player", "game"]]
