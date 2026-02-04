from django.contrib import admin
from .models import Organization, Player, Game, Team, PhysicalConditionReport


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "pseudo", "organization", "phone", "created_at")
    list_filter = ("organization",)
    search_fields = ("pseudo", "user__username", "user__email")


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ("id", "organization", "game_date", "team_a_goals", "team_b_goals", "distribution_code", "created_at")
    list_filter = ("organization",)
    date_hierarchy = "game_date"


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("id", "game", "side")
    list_filter = ("game",)
    filter_horizontal = ("players",)


@admin.register(PhysicalConditionReport)
class PhysicalConditionReportAdmin(admin.ModelAdmin):
    list_display = ("id", "player", "game", "score", "created_at")
    list_filter = ("game",)
