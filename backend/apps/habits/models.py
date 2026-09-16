from datetime import date, timedelta
from django.db import models
from django.conf import settings
from apps.core.models import BaseModel

class Habit(BaseModel):
    class Frequency(models.TextChoices):
        DAILY = 'daily', 'Daily'
        WEEKDAYS = 'weekdays', 'Weekdays Only'
        TARGET_DAYS = 'target_days_per_week', 'Target Days Per Week'
        CUSTOM = 'custom', 'Custom'

    class HabitType(models.TextChoices):
        BOOLEAN = 'boolean', 'Yes/No (Check-off)'
        NUMERIC = 'numeric', 'Numeric Target'

    class TimeWindow(models.TextChoices):
        ANYTIME = 'anytime', 'Anytime'
        MORNING = 'morning', 'Morning'
        AFTERNOON = 'afternoon', 'Afternoon'
        EVENING = 'evening', 'Evening'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='habits'
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, default='')
    frequency = models.CharField(max_length=30, choices=Frequency.choices, default=Frequency.DAILY)
    target_days_per_week = models.PositiveIntegerField(default=7, null=True, blank=True)
    type = models.CharField(max_length=20, choices=HabitType.choices, default=HabitType.BOOLEAN)
    target_value = models.DecimalField(max_digits=10, decimal_places=2, default=1.0)
    unit = models.CharField(max_length=30, blank=True, default='')
    preferred_time_window = models.CharField(max_length=30, choices=TimeWindow.choices, default=TimeWindow.ANYTIME)
    color_hex = models.CharField(max_length=7, default='#10B981')
    icon = models.CharField(max_length=50, default='check-circle')
    current_streak = models.PositiveIntegerField(default=0)
    best_streak = models.PositiveIntegerField(default=0)
    is_archived = models.BooleanField(default=False)

    class Meta:
        db_table = 'habits'
        verbose_name = 'Habit'
        verbose_name_plural = 'Habits'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.name} (Streak: {self.current_streak})"

    def recalculate_streaks(self):
        """Calculate current consecutive streak and all-time best streak."""
        completed_dates = set(
            self.logs.filter(
                deleted_at__isnull=True,
                logged_value__gte=self.target_value
            ).values_list('log_date', flat=True)
        )

        if not completed_dates:
            self.current_streak = 0
            self.best_streak = 0
            self.save(update_fields=['current_streak', 'best_streak', 'updated_at'])
            return

        today = date.today()
        yesterday = today - timedelta(days=1)

        # Calculate current streak
        streak = 0
        if today in completed_dates:
            check_date = today
        elif yesterday in completed_dates:
            check_date = yesterday
        else:
            check_date = None

        if check_date:
            curr = check_date
            while curr in completed_dates:
                streak += 1
                curr -= timedelta(days=1)

        # Calculate historical best streak
        sorted_dates = sorted(completed_dates)
        best = 0
        current_run = 0
        prev_date = None

        for d in sorted_dates:
            if prev_date is None or d == prev_date + timedelta(days=1):
                current_run += 1
            else:
                current_run = 1
            if current_run > best:
                best = current_run
            prev_date = d

        self.current_streak = streak
        self.best_streak = max(best, self.best_streak, streak)
        self.save(update_fields=['current_streak', 'best_streak', 'updated_at'])


class HabitLog(BaseModel):
    habit = models.ForeignKey(
        Habit,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='habit_logs'
    )
    log_date = models.DateField()
    logged_value = models.DecimalField(max_digits=10, decimal_places=2, default=1.0)
    is_frozen = models.BooleanField(default=False)
    friction_rating = models.PositiveSmallIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'habit_logs'
        verbose_name = 'Habit Log'
        verbose_name_plural = 'Habit Logs'
        unique_together = ('habit', 'log_date')
        ordering = ['-log_date', '-created_at']

    def __str__(self):
        return f"{self.habit.name} - {self.log_date} ({self.logged_value})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.habit.recalculate_streaks()

    def delete(self, *args, **kwargs):
        habit = self.habit
        super().delete(*args, **kwargs)
        habit.recalculate_streaks()
