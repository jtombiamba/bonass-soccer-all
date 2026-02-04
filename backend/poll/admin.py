from django.contrib import admin
from .models import WeeklyPoll, PollResponse


@admin.register(WeeklyPoll)
class WeeklyPollAdmin(admin.ModelAdmin):
    list_display = ("id", "game", "created_at")
    list_filter = ("game__game_date",)


@admin.register(PollResponse)
class PollResponseAdmin(admin.ModelAdmin):
    list_display = ("id", "poll", "player", "available", "created_at")
    list_filter = ("available", "poll")
