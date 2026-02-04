from rest_framework import serializers
from .models import EvaluationRound, SkillEvaluation
from players.models import Player


class SkillEvaluationSerializer(serializers.ModelSerializer):
    evaluated_pseudo = serializers.CharField(source="evaluated.pseudo", read_only=True)

    class Meta:
        model = SkillEvaluation
        fields = (
            "id", "round", "evaluator", "evaluated", "evaluated_pseudo",
            "pace_skill", "assist_skill", "defensive_skill", "dribbling_skill", "shooting_skill",
            "created_at",
        )
        read_only_fields = ("evaluator", "round")

    def validate(self, data):
        for field in ("pace_skill", "assist_skill", "defensive_skill", "dribbling_skill", "shooting_skill"):
            v = data.get(field)
            if v is not None and (v < 0 or v > 100):
                raise serializers.ValidationError({field: "Must be between 0 and 100."})
        return data


class SkillEvaluationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillEvaluation
        fields = ("evaluated", "pace_skill", "assist_skill", "defensive_skill", "dribbling_skill", "shooting_skill")

    def validate(self, data):
        for field in ("pace_skill", "assist_skill", "defensive_skill", "dribbling_skill", "shooting_skill"):
            v = data.get(field)
            if v is not None and (v < 0 or v > 100):
                raise serializers.ValidationError({field: "Must be between 0 and 100."})
        return data


class EvaluationRoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationRound
        fields = ("id", "year", "month", "created_at")
