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
    game_status = serializers.CharField(source="game.status", read_only=True)
    responses = PollResponseSerializer(many=True, read_only=True)
    max_players = serializers.IntegerField(read_only=True)
    min_players = serializers.IntegerField(read_only=True)
    is_locked = serializers.BooleanField(read_only=True)
    locked_at = serializers.DateTimeField(read_only=True)
    locked_by_max = serializers.BooleanField(read_only=True)
    hard_lock = serializers.BooleanField(read_only=True)
    available_count = serializers.SerializerMethodField()

    class Meta:
        model = WeeklyPoll
        fields = (
            "id", "game", "game_date", "game_status",
            "max_players", "min_players", "is_locked", "locked_at",
            "locked_by_max", "hard_lock", "available_count",
            "responses", "created_at"
        )

    def get_available_count(self, obj):
        from .services import available_count
        return available_count(obj)
