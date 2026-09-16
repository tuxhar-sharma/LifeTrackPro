from datetime import date, timedelta, datetime
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound, ValidationError
from .models import Habit, HabitLog
from .serializers import HabitSerializer, HabitLogSerializer

DEFAULT_HABITS = [
    {
        "name": "Morning Hydration (500ml)",
        "description": "Kickstart metabolic rate and mental alertness right after waking.",
        "type": "boolean",
        "target_value": 1.0,
        "color_hex": "#3B82F6",
        "icon": "droplet",
        "preferred_time_window": "morning"
    },
    {
        "name": "90-Minute Deep Work Session",
        "description": "Zero phone, zero social media deep focus block on top priority goal.",
        "type": "boolean",
        "target_value": 1.0,
        "color_hex": "#6366F1",
        "icon": "brain",
        "preferred_time_window": "morning"
    },
    {
        "name": "Physical Activity / Workout (45 min)",
        "description": "Strength training, running, or high-cadence walk outdoors.",
        "type": "boolean",
        "target_value": 1.0,
        "color_hex": "#10B981",
        "icon": "activity",
        "preferred_time_window": "afternoon"
    },
    {
        "name": "Read 15 Pages of Non-Fiction",
        "description": "Compound knowledge across psychology, engineering, or philosophy.",
        "type": "boolean",
        "target_value": 1.0,
        "color_hex": "#F59E0B",
        "icon": "book-open",
        "preferred_time_window": "evening"
    },
]

def ensure_default_habits(user):
    """Seed initial high-leverage habits for new accounts."""
    if not Habit.objects.filter(user=user).exists():
        Habit.objects.bulk_create([
            Habit(
                user=user,
                name=h["name"],
                description=h["description"],
                type=h["type"],
                target_value=h["target_value"],
                color_hex=h["color_hex"],
                icon=h["icon"],
                preferred_time_window=h["preferred_time_window"]
            )
            for h in DEFAULT_HABITS
        ])

class HabitListCreateView(generics.ListCreateAPIView):
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        date_str = self.request.query_params.get('date')
        if date_str:
            try:
                ctx['target_date'] = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                ctx['target_date'] = date.today()
        else:
            ctx['target_date'] = date.today()
        return ctx

    def get_queryset(self):
        ensure_default_habits(self.request.user)
        return Habit.objects.filter(
            user=self.request.user,
            deleted_at__isnull=True,
            is_archived=False
        ).prefetch_related('logs')


class HabitDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user, deleted_at__isnull=True)

    def perform_destroy(self, instance):
        instance.soft_delete()


class HabitToggleTodayView(APIView):
    """One-click toggle for habit completion on today or a specific date."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            habit = Habit.objects.get(id=pk, user=request.user, deleted_at__isnull=True)
        except Habit.DoesNotExist:
            raise NotFound("Habit not found.")

        date_str = request.data.get('date')
        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            target_date = date.today()

        existing_log = HabitLog.objects.filter(
            habit=habit,
            user=request.user,
            log_date=target_date,
            deleted_at__isnull=True
        ).first()

        if existing_log and existing_log.logged_value >= habit.target_value:
            # Already completed: un-check it
            existing_log.delete()
            was_completed = False
        else:
            # Check it off
            logged_val = request.data.get('logged_value', habit.target_value)
            if existing_log:
                existing_log.logged_value = logged_val
                existing_log.save()
            else:
                HabitLog.objects.create(
                    habit=habit,
                    user=request.user,
                    log_date=target_date,
                    logged_value=logged_val,
                    friction_rating=request.data.get('friction_rating'),
                    notes=request.data.get('notes', '')
                )
            was_completed = True

        habit.refresh_from_db()
        serializer = HabitSerializer(habit, context={'request': request, 'target_date': target_date})
        return Response({
            'status': 'success',
            'completed': was_completed,
            'habit': serializer.data
        })


class HabitLogListCreateView(generics.ListCreateAPIView):
    serializer_class = HabitLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = HabitLog.objects.filter(user=self.request.user, deleted_at__isnull=True)
        habit_id = self.request.query_params.get('habit')
        if habit_id:
            qs = qs.filter(habit_id=habit_id)
        start_date = self.request.query_params.get('start_date')
        if start_date:
            qs = qs.filter(log_date__gte=start_date)
        end_date = self.request.query_params.get('end_date')
        if end_date:
            qs = qs.filter(log_date__lte=end_date)
        return qs.order_by('-log_date')


class HabitStatsView(APIView):
    """Provides habit discipline index, completion counts, and weekly metrics."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        habits = Habit.objects.filter(user=user, deleted_at__isnull=True, is_archived=False)
        total_habits = habits.count()

        # Today's completed count
        today_completed_count = HabitLog.objects.filter(
            user=user,
            log_date=today,
            deleted_at__isnull=True
        ).values('habit_id').distinct().count()

        discipline_index = round((today_completed_count / total_habits * 100), 1) if total_habits > 0 else 0.0

        # Maximum streak across all habits
        best_current_streak = max([h.current_streak for h in habits], default=0)

        # Weekly grid for last 7 days
        weekly_grid = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_completed = HabitLog.objects.filter(
                user=user,
                log_date=day,
                deleted_at__isnull=True
            ).values('habit_id').distinct().count()
            weekly_grid.append({
                'date': str(day),
                'day_name': day.strftime('%a'),
                'completed_count': day_completed,
                'total_habits': total_habits,
                'rate': round((day_completed / total_habits * 100), 1) if total_habits > 0 else 0.0
            })

        return Response({
            'total_habits': total_habits,
            'today_completed_count': today_completed_count,
            'discipline_index': discipline_index,
            'best_current_streak': best_current_streak,
            'weekly_grid': weekly_grid
        })
