import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from apps.authentication.models import User
from apps.expenses.models import ExpenseCategory, Expense, Budget
from apps.income.models import IncomeSource, Income
from apps.habits.models import Habit, HabitLog

@pytest.mark.django_db
class TestAnalytics:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='analyst@lifetrackpro.io',
            password='TestPassword123!',
            first_name='Financial',
            last_name='Analyst'
        )
        self.client.force_authenticate(user=self.user)

    def test_cashflow_endpoint(self):
        # Create income: $6,000
        source = IncomeSource.objects.create(user=self.user, name='Salary', stream_type='salary')
        Income.objects.create(
            user=self.user,
            source=source,
            amount_cents=600000,
            currency='USD',
            received_date='2026-03-01'
        )

        # Create expense: $2,400
        cat = ExpenseCategory.objects.create(user=self.user, name='Housing')
        Expense.objects.create(
            user=self.user,
            category=cat,
            amount_cents=240000,
            currency='USD',
            transaction_date='2026-03-05'
        )

        url = reverse('analytics-cashflow') + '?start_date=2026-03-01&end_date=2026-03-31'
        response = self.client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert data['total_income'] == 6000.00
        assert data['total_expense'] == 2400.00
        assert data['net_savings'] == 3600.00
        assert data['savings_rate'] == 60.0
        assert data['cash_flow_status'] == 'positive'

    def test_financial_health_score(self):
        from django.utils import timezone
        today = timezone.now().date()
        # Create income and expense with healthy savings
        source = IncomeSource.objects.create(user=self.user, name='Salary', stream_type='salary')
        Income.objects.create(
            user=self.user,
            source=source,
            amount_cents=1000000,
            currency='USD',
            received_date=today
        )

        cat = ExpenseCategory.objects.create(user=self.user, name='Living')
        Expense.objects.create(
            user=self.user,
            category=cat,
            amount_cents=300000,
            currency='USD',
            transaction_date=today
        )

        url = reverse('analytics-health-score')
        response = self.client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert data['score'] >= 50
        assert 'grade' in data
        assert 'recommendation' in data

    def test_historical_trends_endpoint(self):
        url = reverse('analytics-trends')
        response = self.client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert len(data['history']) == 6
        for m in data['history']:
            assert 'month_label' in m
            assert 'income' in m
            assert 'expense' in m
            assert 'savings_rate' in m
