from django.contrib import admin
from .models import EvaluationRound, SkillEvaluation


@admin.register(EvaluationRound)
class EvaluationRoundAdmin(admin.ModelAdmin):
    list_display = ("id", "year", "month", "created_at")
    list_filter = ("year", "month")


@admin.register(SkillEvaluation)
class SkillEvaluationAdmin(admin.ModelAdmin):
    list_display = ("id", "round", "evaluator", "evaluated", "pace_skill", "assist_skill", "defensive_skill", "dribbling_skill", "shooting_skill", "created_at")
    list_filter = ("round",)
