from rest_framework import serializers
from .models import UserPreferences

class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = [
            'id', 'base_currency', 'timezone', 'date_format',
            'theme', 'email_notifications', 'push_notifications',
            'weekly_digest_enabled', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']
