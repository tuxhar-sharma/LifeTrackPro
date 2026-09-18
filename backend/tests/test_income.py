import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from apps.authentication.models import User
from apps.income.models import IncomeSource, Income

@pytest.mark.django_db
class TestIncome:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='testuser@lifetrackpro.io',
            password='TestPassword123!',
            first_name='Test',
            last_name='User'
        )
        self.client.force_authenticate(user=self.user)

    def test_auto_seed_income_sources(self):
        url = reverse('income-sources-list-create')
        response = self.client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert len(data['results']) >= 4
        source_names = [s['name'] for s in data['results']]
        assert 'Primary Salary / W2' in source_names

    def test_create_income_entry(self):
        # 1. Fetch or create source
        source = IncomeSource.objects.create(
            user=self.user,
            name='Consulting',
            stream_type='freelance'
        )

        url = reverse('income-list-create')
        payload = {
            'source': str(source.id),
            'amount': '3500.00',
            'currency': 'USD',
            'received_date': '2026-03-15',
            'payer_name': 'TechCorp LLC',
            'is_recurring': True,
            'recurrence_interval': 'monthly',
            'notes': 'Sprint delivery milestone'
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == 201
        data = response.json()
        assert data['amount'] == 3500.00
        assert data['amount_cents'] == 350000
        assert data['payer_name'] == 'TechCorp LLC'
        assert data['is_recurring'] is True

    def test_income_summary_analytics(self):
        source = IncomeSource.objects.create(
            user=self.user,
            name='Salary',
            stream_type='salary'
        )
        Income.objects.create(
            user=self.user,
            source=source,
            amount_cents=500000,
            currency='USD',
            received_date='2026-03-01'
        )

        url = reverse('income-summary') + '?start_date=2026-03-01&end_date=2026-03-31'
        response = self.client.get(url)
        assert response.status_code == 200
        data = response.json()
        assert data['total_cents'] == 500000
        assert data['total'] == 5000.00
        assert len(data['source_breakdown']) == 1
        assert data['source_breakdown'][0]['source_name'] == 'Salary'
