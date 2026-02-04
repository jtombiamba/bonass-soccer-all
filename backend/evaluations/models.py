from django.db import models
from players.models import Player


class EvaluationRound(models.Model):
    """Monthly round of peer evaluations."""
    year = models.PositiveIntegerField()
    month = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "evaluations_round"
        unique_together = [["year", "month"]]
        ordering = ["-year", "-month"]


class SkillEvaluation(models.Model):
    """One player evaluating another: pace, assist, defensive, dribbling, shooting (0-100)."""
    round = models.ForeignKey(EvaluationRound, on_delete=models.CASCADE, related_name="evaluations")
    evaluator = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="evaluations_given")
    evaluated = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="evaluations_received")
    pace_skill = models.PositiveIntegerField()      # 0-100
    assist_skill = models.PositiveIntegerField()   # 0-100
    defensive_skill = models.PositiveIntegerField()  # 0-100
    dribbling_skill = models.PositiveIntegerField()  # 0-100
    shooting_skill = models.PositiveIntegerField()   # 0-100
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "evaluations_skill"
        unique_together = [["round", "evaluator", "evaluated"]]
