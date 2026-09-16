from datetime import date
from rest_framework import serializers
from .models import Habit, HabitLog

class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = [
            'id', 'habit', 'log_date', 'logged_value',
            'is_frozen', 'friction_rating', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        user = self.context['request'].user
        habit = attrs.get('habit')
        if habit and habit.user != user:
            raise serializers.ValidationError({'habit': 'Habit does not belong to active account.'})
        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class HabitSerializer(serializers.ModelSerializer):
    is_completed_today = serializers.SerializerMethodField(read_only=True)
    today_logged_value = serializers.SerializerMethodField(read_only=True)
    today_log_id = serializers.SerializerMethodField(read_only=True)
    streak_tier = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Habit
        fields = [
            'id', 'name', 'description', 'frequency', 'target_days_per_week',
            'type', 'target_value', 'unit', 'preferred_time_window',
            'color_hex', 'icon', 'current_streak', 'best_streak',
            'is_archived', 'is_completed_today', 'today_logged_value',
            'today_log_id', 'streak_tier', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'current_streak', 'best_streak', 'is_completed_today',
            'today_logged_value', 'today_log_id', 'streak_tier',
            'created_at', 'updated_at'
        ]

    def _get_today_log(self, obj):
        if not hasattr(obj, '_cached_today_log'):
            target_date = self.context.get('target_date') or date.today()
            obj._cached_today_log = obj.logs.filter(
                log_date=target_date,
                deleted_at__isnull=True
            ).first()
        return obj._cached_today_log

    def get_is_completed_today(self, obj) -> bool:
        log = self._get_today_log(obj)
        if not log:
            return False
        return log.logged_value >= obj.target_value

    def get_today_logged_value(self, obj):
        log = self._get_today_log(obj)
        return float(log.logged_value) if log else None

    def get_today_log_id(self, obj):
        log = self._get_today_log(obj)
        return str(log.id) if log else None

    def get_streak_tier(self, obj) -> str:
        s = obj.current_streak
        if s >= 30:
            return 'diamond'
        elif s >= 14:
            return 'gold'
        elif s >= 7:
            return 'silver'
        elif s >= 3:
            return 'bronze'
        return 'starting'

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
