import pytest
from rest_framework.test import APIClient
from rest_framework import status
from apps.authentication.models import User

@pytest.mark.django_db
class TestAuthentication:
    def setup_method(self):
        self.client = APIClient()

    def test_register_user_success(self):
        payload = {
            "email": "alex@lifetrackpro.io",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "first_name": "Alex",
            "last_name": "Vance"
        }
        response = self.client.post('/api/v1/auth/register/', payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'success'
        assert response.data['user']['email'] == 'alex@lifetrackpro.io'
        assert 'tokens' in response.data
        assert 'access' in response.data['tokens']
        assert 'refresh' in response.data['tokens']
        assert User.objects.filter(email='alex@lifetrackpro.io').exists()

    def test_register_password_mismatch(self):
        payload = {
            "email": "mismatch@lifetrackpro.io",
            "password": "Password123!",
            "password_confirm": "DifferentPassword123!",
            "first_name": "Mismatch",
            "last_name": "User"
        }
        response = self.client.post('/api/v1/auth/register/', payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password_confirm' in response.data

    def test_login_success(self):
        user = User.objects.create_user(
            email="login_test@lifetrackpro.io",
            password="StrongPassword123!",
            first_name="Login",
            last_name="Tester"
        )
        payload = {
            "email": "login_test@lifetrackpro.io",
            "password": "StrongPassword123!"
        }
        response = self.client.post('/api/v1/auth/login/', payload)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'success'
        assert 'tokens' in response.data

    def test_current_user_profile(self):
        user = User.objects.create_user(
            email="me_test@lifetrackpro.io",
            password="StrongPassword123!",
            first_name="Current",
            last_name="User"
        )
        self.client.force_authenticate(user=user)
        response = self.client.get('/api/v1/auth/me/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == "me_test@lifetrackpro.io"
        assert response.data['first_name'] == "Current"
