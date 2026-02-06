"""
Services for evaluation assignments.
"""
import random
from typing import Optional

from django.db import transaction
from players.models import Player, Organization
from .models import EvaluationRound, EvaluationAssignment


def create_monthly_assignments(
    evaluation_round: EvaluationRound,
    organization: Optional[Organization] = None,
    assignments_per_evaluator: int = 5,
) -> int:
    """
    Create monthly evaluation assignments for all players in the given organization.
    Each player is assigned `assignments_per_evaluator` other distinct players to evaluate
    (excluding themselves). If the organization has fewer players, assign as many as possible.

    If assignments already exist for this round, they are not recreated (returns 0).

    Returns the number of assignments created.
    """
    if organization is None:
        # Use the first organization (single-tenant assumption)
        organization = Organization.objects.first()
        if not organization:
            return 0

    # Check if assignments already exist for this round
    if EvaluationAssignment.objects.filter(round=evaluation_round).exists():
        # Already generated, skip
        return 0

    players = list(organization.players.all())
    if len(players) < 2:
        # No one to evaluate
        return 0

    max_possible = min(assignments_per_evaluator, len(players) - 1)
    if max_possible == 0:
        return 0

    created = 0
    with transaction.atomic():
        for evaluator in players:
            # List of possible evaluated players (excluding self)
            candidates = [p for p in players if p.id != evaluator.id]
            # Shuffle to randomize
            random.shuffle(candidates)
            # Take up to max_possible
            selected = candidates[:max_possible]
            for evaluated in selected:
                # Use get_or_create to avoid duplicates (though uniqueness constraint will protect)
                assignment, created_flag = EvaluationAssignment.objects.get_or_create(
                    round=evaluation_round,
                    evaluator=evaluator,
                    evaluated=evaluated,
                )
                if created_flag:
                    created += 1

    return created


def get_assignments_for_player(player: Player, evaluation_round: EvaluationRound):
    """
    Return assigned players for a given player in a given round.
    """
    return EvaluationAssignment.objects.filter(
        round=evaluation_round, evaluator=player
    ).select_related("evaluated")


def assign_all_organizations():
    """
    Create assignments for all organizations (currently single organization).
    """
    # Get the current month's round (should exist)
    from django.utils import timezone
    now = timezone.now()
    round_obj = EvaluationRound.objects.filter(year=now.year, month=now.month).first()
    if not round_obj:
        # Create it (should have been created by the Celery task)
        round_obj = EvaluationRound.objects.create(year=now.year, month=now.month)

    orgs = Organization.objects.all()
    total = 0
    for org in orgs:
        total += create_monthly_assignments(round_obj, org)
    return total