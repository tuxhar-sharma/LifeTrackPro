import calendar
from datetime import date, timedelta
from django.db.models import Sum
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from apps.expenses.models import Expense, Budget
from apps.income.models import Income
from apps.habits.models import Habit, HabitLog

class CashFlowView(APIView):
    """
    Computes unified cash flow (Inflow vs Outflow), net savings, and savings rate.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        first_of_month = today.replace(day=1)

        start_date_str = request.query_params.get('start_date', str(first_of_month))
        end_date_str = request.query_params.get('end_date', str(today))

        # Inflow (Income)
        income_agg = Income.objects.filter(
            user=user,
            received_date__gte=start_date_str,
            received_date__lte=end_date_str,
            deleted_at__isnull=True
        ).aggregate(total=Sum('amount_cents'))
        total_income_cents = income_agg['total'] or 0

        # Outflow (Expenses)
        expense_agg = Expense.objects.filter(
            user=user,
            transaction_date__gte=start_date_str,
            transaction_date__lte=end_date_str,
            deleted_at__isnull=True
        ).aggregate(total=Sum('amount_cents'))
        total_expense_cents = expense_agg['total'] or 0

        net_savings_cents = total_income_cents - total_expense_cents
        savings_rate = (
            round((net_savings_cents / total_income_cents) * 100, 1)
            if total_income_cents > 0
            else 0.0
        )

        return Response({
            'period': {
                'start_date': start_date_str,
                'end_date': end_date_str,
            },
            'total_income_cents': total_income_cents,
            'total_income': round(total_income_cents / 100.0, 2),
            'total_expense_cents': total_expense_cents,
            'total_expense': round(total_expense_cents / 100.0, 2),
            'net_savings_cents': net_savings_cents,
            'net_savings': round(net_savings_cents / 100.0, 2),
            'savings_rate': savings_rate,
            'cash_flow_status': 'positive' if net_savings_cents >= 0 else 'negative',
        })


class FinancialHealthScoreView(APIView):
    """
    Algorithmic 0-100 Health Score evaluating savings rate, budget discipline, and habit synergy.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        first_of_month = today.replace(day=1)

        # 1. Savings Rate Score (Max 40 points)
        income_agg = Income.objects.filter(
            user=user,
            received_date__gte=first_of_month,
            received_date__lte=today,
            deleted_at__isnull=True
        ).aggregate(total=Sum('amount_cents'))
        total_income = income_agg['total'] or 0

        expense_agg = Expense.objects.filter(
            user=user,
            transaction_date__gte=first_of_month,
            transaction_date__lte=today,
            deleted_at__isnull=True
        ).aggregate(total=Sum('amount_cents'))
        total_expense = expense_agg['total'] or 0

        net_savings = total_income - total_expense
        savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0.0

        if savings_rate >= 35:
            savings_score = 40
        elif savings_rate >= 25:
            savings_score = 32
        elif savings_rate >= 15:
            savings_score = 24
        elif savings_rate >= 5:
            savings_score = 16
        elif savings_rate > 0:
            savings_score = 8
        else:
            savings_score = 0

        # 2. Budget Adherence Score (Max 35 points)
        active_budgets = Budget.objects.filter(
            user=user,
            period_start__lte=today,
            period_end__gte=today,
            deleted_at__isnull=True
        )
        total_budgets = active_budgets.count()

        if total_budgets > 0:
            adherent_count = 0
            for b in active_budgets:
                spent = Expense.objects.filter(
                    user=user,
                    category=b.category,
                    transaction_date__gte=b.period_start,
                    transaction_date__lte=b.period_end,
                    deleted_at__isnull=True
                ).aggregate(total=Sum('amount_cents'))['total'] or 0

                if spent <= b.limit_cents:
                    adherent_count += 1
            budget_score = round((adherent_count / total_budgets) * 35)
        else:
            # Baseline score if no budgets yet configured
            budget_score = 25

        # 3. Habit Discipline Synergy Score (Max 25 points)
        habits = Habit.objects.filter(user=user, deleted_at__isnull=True, is_archived=False)
        total_habits = habits.count()
        if total_habits > 0:
            completed_today = HabitLog.objects.filter(
                user=user,
                log_date=today,
                deleted_at__isnull=True
            ).values('habit_id').distinct().count()
            discipline_pct = (completed_today / total_habits)
            habit_score = round(discipline_pct * 25)
        else:
            habit_score = 20

        total_score = min(100, max(0, savings_score + budget_score + habit_score))

        if total_score >= 85:
            grade = "Optimal Tier"
            summary_advice = "Your telemetry demonstrates institutional-grade capital retention and behavioral discipline."
        elif total_score >= 70:
            grade = "Strong Foundation"
            summary_advice = "Solid savings cadence. Continue monitoring non-essential category burn rates."
        elif total_score >= 50:
            grade = "Moderate Velocity"
            summary_advice = "Elevate automated recurring savings to stabilize net cash flow."
        else:
            grade = "Capital Vulnerability"
            summary_advice = "Outflow velocity is exceeding intake. Review recurring subscription obligations."

        return Response({
            'score': total_score,
            'grade': grade,
            'breakdown': {
                'savings_score': savings_score,
                'max_savings_score': 40,
                'budget_score': budget_score,
                'max_budget_score': 35,
                'habit_score': habit_score,
                'max_habit_score': 25,
            },
            'metrics': {
                'current_savings_rate': round(savings_rate, 1),
                'active_budgets_tracked': total_budgets,
                'habits_tracked': total_habits,
            },
            'recommendation': summary_advice
        })


class HistoricalTrendsView(APIView):
    """
    Delivers 6-month historical monthly breakdown of income vs expenses and savings rates.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        months_data = []
        for i in range(5, -1, -1):
            year = today.year
            month = today.month - i
            while month <= 0:
                month += 12
                year -= 1
            _, last_day = calendar.monthrange(year, month)
            start_date = date(year, month, 1)
            end_date = date(year, month, last_day)

            inc_cents = Income.objects.filter(
                user=user,
                received_date__gte=start_date,
                received_date__lte=end_date,
                deleted_at__isnull=True
            ).aggregate(t=Sum('amount_cents'))['t'] or 0

            exp_cents = Expense.objects.filter(
                user=user,
                transaction_date__gte=start_date,
                transaction_date__lte=end_date,
                deleted_at__isnull=True
            ).aggregate(t=Sum('amount_cents'))['t'] or 0

            savings_cents = inc_cents - exp_cents
            rate = round((savings_cents / inc_cents * 100), 1) if inc_cents > 0 else 0.0

            months_data.append({
                'month_key': start_date.strftime('%Y-%m'),
                'month_label': start_date.strftime('%b %Y'),
                'short_label': start_date.strftime('%b'),
                'income_cents': inc_cents,
                'income': round(inc_cents / 100.0, 2),
                'expense_cents': exp_cents,
                'expense': round(exp_cents / 100.0, 2),
                'savings_cents': savings_cents,
                'savings': round(savings_cents / 100.0, 2),
                'savings_rate': rate,
            })

        return Response({
            'history': months_data
        })
