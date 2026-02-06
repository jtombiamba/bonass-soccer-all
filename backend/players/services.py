"""
Scoring and team distribution logic.
Final score = 0.15*pace + 0.3*physical + 0.15*assist + 0.15*defensive + 0.1*dribbling + 0.15*shooting
Peer skills = mean of last 5 evaluations.
"""
import random
from django.db.models import Avg
from django.db.models.functions import Coalesce

from .models import Player, Game, Team, PhysicalConditionReport
from evaluations.models import SkillEvaluation


def get_last_5_skill_means(player):
    """Return dict of skill name -> mean of last 5 evaluations (or 0 if none)."""
    qs = SkillEvaluation.objects.filter(evaluated=player).order_by("-created_at")[:5]
    if not qs.exists():
        return {"pace": 0, "assist": 0, "defensive": 0, "dribbling": 0, "shooting": 0}
    agg = qs.aggregate(
        pace=Coalesce(Avg("pace_skill"), 0),
        assist=Coalesce(Avg("assist_skill"), 0),
        defensive=Coalesce(Avg("defensive_skill"), 0),
        dribbling=Coalesce(Avg("dribbling_skill"), 0),
        shooting=Coalesce(Avg("shooting_skill"), 0),
    )
    return {k: round(v, 2) for k, v in agg.items()}


def get_physical_for_game(player, game):
    """Physical condition score (0-100) for this game, or 0 if not submitted."""
    try:
        report = PhysicalConditionReport.objects.get(player=player, game=game)
        return report.score
    except PhysicalConditionReport.DoesNotExist:
        return 0


def compute_final_score(player, game):
    """
    Final evaluation = 0.15*pace + 0.3*physical + 0.15*assist + 0.15*defensive + 0.1*dribbling + 0.15*shooting
    """
    means = get_last_5_skill_means(player)
    physical = get_physical_for_game(player, game)
    score = (
        0.15 * means["pace"]
        + 0.30 * physical
        + 0.15 * means["assist"]
        + 0.15 * means["defensive"]
        + 0.10 * means["dribbling"]
        + 0.15 * means["shooting"]
    )
    return round(score, 2)


def assign_teams_by_weighted_scores(game, player_ids_or_queryset: list):
    """
    Split players into two teams by balancing total weighted score.
    player_ids_or_queryset: list of Player ids or queryset of Players (available for this game).
    """
    # if hasattr(player_ids_or_queryset, "__iter__") and not isinstance(player_ids_or_queryset, type(Player.objects.none())):
    #     if player_ids_or_queryset and hasattr(next(iter(player_ids_or_queryset), "id", None):
    #         players = list(player_ids_or_queryset)
    #     else:
    players = list(Player.objects.filter(id__in=player_ids_or_queryset))
    # else:
    #     players = list(player_ids_or_queryset)
    if not players:
        return
    # Shuffle then sort by score descending for deterministic but "random" split
    scores = [(p, compute_final_score(p, game)) for p in players]
    random.shuffle(scores)
    scores.sort(key=lambda x: -x[1])
    team_a = []
    team_b = []
    sum_a = sum_b = 0
    for p, s in scores:
        if sum_a <= sum_b:
            team_a.append(p)
            sum_a += s
        else:
            team_b.append(p)
            sum_b += s
    # Create or update Team records
    team_a_obj, _ = Team.objects.get_or_create(game=game, side=Team.TeamSide.A)
    team_b_obj, _ = Team.objects.get_or_create(game=game, side=Team.TeamSide.B)
    team_a_obj.players.set(team_a)
    team_b_obj.players.set(team_b)
