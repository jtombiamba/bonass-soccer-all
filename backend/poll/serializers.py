from rest_framework import serializers
from .models import WeeklyPoll, PollResponse
from players.models import Game


class PollResponseSerializer(serializers.ModelSerializer):
    player_pseudo = serializers.CharField(source="player.pseudo", read_only=True)

    class Meta:
        model = PollResponse
        fields = ("id", "poll", "player", "player_pseudo", "available", "created_at")
        read_only_fields = ("player",)


class AnswerPollSerializer(serializers.Serializer):
    available = serializers.BooleanField()


class WeeklyPollSerializer(serializers.ModelSerializer):
    game_date = serializers.DateField(source="game.game_date", read_only=True)
    responses = PollResponseSerializer(many=True, read_only=True)

    class Meta:
        model = WeeklyPoll
        fields = ("id", "game", "game_date", "responses", "created_at")
