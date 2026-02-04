from rest_framework import serializers
from .models import Organization, Player, Game, Team, PhysicalConditionReport
from auth_app.serializers import UserSerializer


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ("id", "name", "created_at")


class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Player
        fields = ("id", "user", "organization", "pseudo", "phone", "created_at")
        read_only_fields = ("user", "organization",)

class PlayerMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ("id", "pseudo", "phone")


class PhysicalConditionReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalConditionReport
        fields = ("id", "player", "game", "score", "created_at")
        read_only_fields = ("player",)

    def validate_score(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Score must be between 0 and 100.")
        return value


class TeamSerializer(serializers.ModelSerializer):
    players = PlayerMinSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ("id", "game", "side", "players")


class GameSerializer(serializers.ModelSerializer):
    teams = TeamSerializer(many=True, read_only=True)
    code_sent_to_player_pseudo = serializers.SerializerMethodField()

    def get_code_sent_to_player_pseudo(self, obj):
        return obj.code_sent_to_player.pseudo if obj.code_sent_to_player else ""

    class Meta:
        model = Game
        fields = (
            "id", "organization", "game_date", "team_a_goals", "team_b_goals",
            "distribution_code", "code_sent_to_player", "code_sent_to_player_pseudo", "teams", "created_at",
        )
        read_only_fields = ("distribution_code", "code_sent_to_player")


class GameListSerializer(serializers.ModelSerializer):
    """Light list view."""
    class Meta:
        model = Game
        fields = ("id", "game_date", "team_a_goals", "team_b_goals", "created_at")


class SubmitScoreSerializer(serializers.Serializer):
    team_a_goals = serializers.IntegerField(min_value=0)
    team_b_goals = serializers.IntegerField(min_value=0)


class AssignCodeAndTeamsSerializer(serializers.Serializer):
    code = serializers.CharField()
