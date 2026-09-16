import pytest
from datetime import date, timedelta
from rest_framework.test import APIClient
from rest_framework import status
from apps.authentication.models import User
from apps.habits.models import Habit, HabitLog

@pytest.mark.django_db
class TestHabits:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="habit_user@lifetrackpro.io",
            password="StrongPassword123!",
            first_name="Habit",
            last_name="Tester"
        )
        self.client.force_authenticate(user=self.user)

    def test_auto_seed_habits(self):
        response = self.client.get('/api/v1/habits/')
        assert response.status_code == status.HTTP_200_OK
        results = response.data['results'] if 'results' in response.data else response.data
        assert len(results) >= 4

    def test_toggle_habit_today(self):
        habit = Habit.objects.create(
            user=self.user,
            name="Evening Mobility Stretch",
            target_value=1.0
        )
        # Toggle ON
        res1 = self.client.post(f'/api/v1/habits/{habit.id}/toggle/')
        assert res1.status_code == status.HTTP_200_OK
        assert res1.data['completed'] is True
        assert res1.data['habit']['current_streak'] == 1
        assert res1.data['habit']['is_completed_today'] is True

        # Toggle OFF
        res2 = self.client.post(f'/api/v1/habits/{habit.id}/toggle/')
        assert res2.status_code == status.HTTP_200_OK
        assert res2.data['completed'] is False
        assert res2.data['habit']['current_streak'] == 0
        assert res2.data['habit']['is_completed_today'] is False

    def test_multi_day_streak_calculation(self):
        habit = Habit.objects.create(
            user=self.user,
            name="Deep Meditation",
            target_value=1.0
        )
        today = date.today()
        # Log past 3 consecutive days + today
        HabitLog.objects.create(user=self.user, habit=habit, log_date=today - timedelta(days=3), logged_value=1.0)
        HabitLog.objects.create(user=self.user, habit=habit, log_date=today - timedelta(days=2), logged_value=1.0)
        HabitLog.objects.create(user=self.user, habit=habit, log_date=today - timedelta(days=1), logged_value=1.0)
        HabitLog.objects.create(user=self.user, habit=habit, log_date=today, logged_value=1.0)

        habit.refresh_from_db()
        assert habit.current_streak == 4
        assert habit.best_streak == 4

    def test_habit_stats_endpoint(self):
        habit = Habit.objects.create(
            user=self.user,
            name="Cardio Session",
            target_value=1.0
        )
        HabitLog.objects.create(user=self.user, habit=habit, log_date=date.today(), logged_value=1.0)

        response = self.client.get('/api/v1/habits/stats/')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['today_completed_count'] >= 1
        assert 'discipline_index' in response.data
        assert len(response.data['weekly_grid']) == 7
