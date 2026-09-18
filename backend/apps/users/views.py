from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import UserPreferences
from .serializers import UserPreferencesSerializer
from apps.expenses.models import Expense, Budget, ExpenseCategory
from apps.income.models import Income, IncomeSource
from apps.habits.models import Habit, HabitLog

class UserPreferencesView(generics.RetrieveUpdateAPIView):
    serializer_class = UserPreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj, _ = UserPreferences.objects.get_or_create(user=self.request.user)
        return obj


class UserExportDataView(APIView):
    """
    Delivers a full GDPR-compliant telemetry data export containing the user's
    entire database records: expenses, budgets, categories, incomes, habits, and logs.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        prefs, _ = UserPreferences.objects.get_or_create(user=user)

        export_payload = {
            'metadata': {
                'exported_at': timezone.now().isoformat(),
                'export_version': '1.0.0',
                'service': 'LifeTrack Pro',
            },
            'user': {
                'id': str(user.id),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'tier': user.tier,
                'avatar_url': getattr(user, 'avatar_url', ''),
                'created_at': user.created_at.isoformat() if hasattr(user, 'created_at') else None,
            },
            'preferences': {
                'base_currency': prefs.base_currency,
                'timezone': prefs.timezone,
                'theme': prefs.theme,
                'date_format': prefs.date_format,
                'email_notifications': prefs.email_notifications,
                'push_notifications': prefs.push_notifications,
            },
            'expenses': list(
                Expense.objects.filter(user=user, deleted_at__isnull=True).values(
                    'id', 'merchant_name', 'amount_cents', 'currency',
                    'transaction_date', 'payment_method', 'is_recurring', 'notes'
                )
            ),
            'expense_categories': list(
                ExpenseCategory.objects.filter(user=user, deleted_at__isnull=True).values(
                    'id', 'name', 'color_hex', 'icon', 'is_system'
                )
            ),
            'budgets': list(
                Budget.objects.filter(user=user, deleted_at__isnull=True).values(
                    'id', 'category__name', 'limit_cents', 'period_start', 'period_end'
                )
            ),
            'incomes': list(
                Income.objects.filter(user=user, deleted_at__isnull=True).values(
                    'id', 'source__name', 'amount_cents', 'currency',
                    'received_date', 'payer_name', 'is_recurring', 'notes'
                )
            ),
            'income_sources': list(
                IncomeSource.objects.filter(user=user, deleted_at__isnull=True).values(
                    'id', 'name', 'stream_type', 'color_hex', 'icon'
                )
            ),
            'habits': list(
                Habit.objects.filter(user=user, deleted_at__isnull=True).values(
                    'id', 'name', 'description', 'frequency', 'target_value',
                    'unit', 'current_streak', 'best_streak'
                )
            ),
            'habit_logs': list(
                HabitLog.objects.filter(user=user, deleted_at__isnull=True).values(
                    'id', 'habit__name', 'log_date', 'logged_value', 'friction_rating', 'notes'
                )
            ),
        }

        return Response(export_payload)
