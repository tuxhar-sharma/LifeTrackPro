import pytest
from datetime import date
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from apps.authentication.models import User
from apps.expenses.models import ExpenseCategory, Expense, Budget

@pytest.mark.django_db
class TestExpenses:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="finance_user@lifetrackpro.io",
            password="StrongPassword123!",
            first_name="Finance",
            last_name="Tester"
        )
        self.client.force_authenticate(user=self.user)

    def test_auto_seed_categories(self):
        response = self.client.get('/api/v1/expenses/categories/')
        assert response.status_code == status.HTTP_200_OK
        # Categories should have been auto-seeded
        assert len(response.data['results'] if 'results' in response.data else response.data) >= 5

    def test_create_expense_with_dollars(self):
        category = ExpenseCategory.objects.create(
            user=self.user,
            name="Groceries",
            color_hex="#10B981"
        )
        payload = {
            "category": str(category.id),
            "amount": "45.75",
            "merchant_name": "Whole Foods Market",
            "transaction_date": "2026-09-15",
            "payment_method": "credit_card",
            "notes": "Weekly meal prep essentials"
        }
        response = self.client.post('/api/v1/expenses/', payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['amount_cents'] == 4575
        assert response.data['amount_display'] == 45.75
        assert response.data['merchant_name'] == "Whole Foods Market"

    def test_budget_spend_tracking(self):
        category = ExpenseCategory.objects.create(
            user=self.user,
            name="Dining Out",
            color_hex="#F59E0B"
        )
        # Log expense
        Expense.objects.create(
            user=self.user,
            category=category,
            amount_cents=5000, # $50.00
            merchant_name="Local Bistro",
            transaction_date=date(2026, 9, 10)
        )
        # Create budget for month
        payload = {
            "category": str(category.id),
            "limit": "200.00",
            "period_start": "2026-09-01",
            "period_end": "2026-09-30"
        }
        response = self.client.post('/api/v1/expenses/budgets/', payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['spent_cents'] == 5000
        assert response.data['remaining_cents'] == 15000
        assert response.data['percentage_used'] == 25.0

    def test_expense_summary_endpoint(self):
        category = ExpenseCategory.objects.create(
            user=self.user,
            name="Subscriptions",
            color_hex="#6366F1"
        )
        today = timezone.now().date()
        Expense.objects.create(
            user=self.user,
            category=category,
            amount_cents=1500,
            merchant_name="Spotify",
            transaction_date=today
        )
        Expense.objects.create(
            user=self.user,
            category=category,
            amount_cents=2000,
            merchant_name="GitHub Copilot",
            transaction_date=today
        )
        response = self.client.get('/api/v1/expenses/summary/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['total_cents'] == 3500
        assert response.data['total'] == 35.0
        assert response.data['count'] == 2
        assert len(response.data['category_breakdown']) == 1
        assert response.data['category_breakdown'][0]['category_name'] == "Subscriptions"
