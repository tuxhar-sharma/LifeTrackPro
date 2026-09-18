from decimal import Decimal
from rest_framework import serializers
from .models import IncomeSource, Income

class IncomeSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncomeSource
        fields = [
            'id', 'name', 'stream_type', 'color_hex', 'icon',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        name = validated_data.get('name')
        source, _ = IncomeSource.objects.get_or_create(
            user=user,
            name=name,
            defaults=validated_data
        )
        return source


class IncomeSerializer(serializers.ModelSerializer):
    source_details = IncomeSourceSerializer(source='source', read_only=True)
    amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, write_only=True
    )

    class Meta:
        model = Income
        fields = [
            'id', 'source', 'source_details', 'amount', 'amount_cents',
            'currency', 'amount_base_currency_cents', 'received_date',
            'is_recurring', 'recurrence_interval', 'payer_name', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'amount_base_currency_cents', 'created_at', 'updated_at']
        extra_kwargs = {
            'amount_cents': {'required': False}
        }

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['amount'] = round(instance.amount_cents / 100.0, 2)
        return ret

    def validate(self, attrs):
        amount = attrs.get('amount')
        amount_cents = attrs.get('amount_cents')

        if amount is not None and amount_cents is None:
            attrs['amount_cents'] = int(Decimal(str(amount)) * 100)
        elif amount_cents is None and self.instance is None:
            raise serializers.ValidationError({"amount": "Either amount or amount_cents is required."})

        # Ensure source belongs to current user
        source = attrs.get('source')
        if source and source.user != self.context['request'].user:
            raise serializers.ValidationError({"source": "Selected income source does not belong to your account."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('amount', None)
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('amount', None)
        return super().update(instance, validated_data)
