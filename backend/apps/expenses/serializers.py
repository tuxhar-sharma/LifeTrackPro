from rest_framework import serializers
from django.db.models import Sum
from .models import ExpenseCategory, Expense, Budget

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'icon', 'color_hex', 'is_system', 'created_at', 'updated_at']
        read_only_fields = ['id', 'is_system', 'created_at', 'updated_at']

    def validate_name(self, value):
        user = self.context['request'].user
        qs = ExpenseCategory.objects.filter(user=user, name__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("An expense category with this name already exists.")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ExpenseSerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, write_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color_hex', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    amount_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'category', 'category_name', 'category_color', 'category_icon',
            'amount', 'amount_cents', 'amount_display', 'currency', 'amount_base_currency_cents',
            'merchant_name', 'transaction_date', 'payment_method',
            'is_recurring', 'is_tax_deductible', 'notes', 'receipt_url',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'amount_display', 'amount_base_currency_cents', 'created_at', 'updated_at']
        extra_kwargs = {
            'amount_cents': {'required': False}
        }

    def get_amount_display(self, obj) -> float:
        return obj.amount

    def validate(self, attrs):
        user = self.context['request'].user
        # Convert decimal amount to amount_cents if supplied
        amount = attrs.pop('amount', None)
        if amount is not None:
            attrs['amount_cents'] = int(round(float(amount) * 100))
        elif 'amount_cents' not in attrs and not self.instance:
            raise serializers.ValidationError({'amount': 'Amount is required.'})

        # Ensure category belongs to current user
        category = attrs.get('category')
        if category and category.user != user:
            raise serializers.ValidationError({'category': 'Category does not belong to the active account.'})

        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BudgetSerializer(serializers.ModelSerializer):
    limit = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, write_only=True)
    limit_display = serializers.SerializerMethodField(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color_hex', read_only=True)
    spent_cents = serializers.SerializerMethodField(read_only=True)
    spent_display = serializers.SerializerMethodField(read_only=True)
    remaining_cents = serializers.SerializerMethodField(read_only=True)
    remaining_display = serializers.SerializerMethodField(read_only=True)
    percentage_used = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'category_name', 'category_color',
            'limit', 'limit_cents', 'limit_display',
            'period_start', 'period_end', 'rollover_enabled',
            'spent_cents', 'spent_display', 'remaining_cents', 'remaining_display',
            'percentage_used', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'limit_display', 'spent_cents', 'spent_display',
            'remaining_cents', 'remaining_display', 'percentage_used',
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'limit_cents': {'required': False}
        }

    def get_limit_display(self, obj) -> float:
        return obj.limit

    def _get_spent_cents(self, obj) -> int:
        total = Expense.objects.filter(
            user=obj.user,
            category=obj.category,
            transaction_date__gte=obj.period_start,
            transaction_date__lte=obj.period_end,
            deleted_at__isnull=True
        ).aggregate(total=Sum('amount_cents'))['total']
        return total or 0

    def get_spent_cents(self, obj) -> int:
        return self._get_spent_cents(obj)

    def get_spent_display(self, obj) -> float:
        return self._get_spent_cents(obj) / 100.0

    def get_remaining_cents(self, obj) -> int:
        return obj.limit_cents - self._get_spent_cents(obj)

    def get_remaining_display(self, obj) -> float:
        return (obj.limit_cents - self._get_spent_cents(obj)) / 100.0

    def get_percentage_used(self, obj) -> float:
        if obj.limit_cents <= 0:
            return 0.0
        spent = self._get_spent_cents(obj)
        return round((spent / obj.limit_cents) * 100, 1)

    def validate(self, attrs):
        user = self.context['request'].user
        limit = attrs.pop('limit', None)
        if limit is not None:
            attrs['limit_cents'] = int(round(float(limit) * 100))
        elif 'limit_cents' not in attrs and not self.instance:
            raise serializers.ValidationError({'limit': 'Budget limit is required.'})

        category = attrs.get('category')
        if category and category.user != user:
            raise serializers.ValidationError({'category': 'Category does not belong to the active account.'})

        start = attrs.get('period_start', getattr(self.instance, 'period_start', None))
        end = attrs.get('period_end', getattr(self.instance, 'period_end', None))
        if start and end and start > end:
            raise serializers.ValidationError({'period_end': 'Period end must be after period start.'})

        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
