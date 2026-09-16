from django.urls import path
from .views import (
    HabitListCreateView,
    HabitDetailView,
    HabitToggleTodayView,
    HabitLogListCreateView,
    HabitStatsView
)

urlpatterns = [
    path('', HabitListCreateView.as_view(), name='habit-list-create'),
    path('stats/', HabitStatsView.as_view(), name='habit-stats'),
    path('logs/', HabitLogListCreateView.as_view(), name='habit-log-list-create'),
    path('<uuid:pk>/', HabitDetailView.as_view(), name='habit-detail'),
    path('<uuid:pk>/toggle/', HabitToggleTodayView.as_view(), name='habit-toggle-today'),
]
