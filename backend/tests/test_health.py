import pytest
from django.urls import reverse
from rest_framework.test import APIClient

@pytest.mark.django_db
class TestHealthCheck:
    def test_health_check_endpoint(self):
        client = APIClient()
        url = reverse('health-check')
        response = client.get(url)

        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'healthy'
        assert data['database'] == 'connected'
        assert data['service'] == 'lifetrack-pro-api'
        assert data['db_latency_ms'] is not None
