from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', include('apps.core.urls')),
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/expenses/', include('apps.expenses.urls')),
    path('api/v1/income/', include('apps.income.urls')),
    path('api/v1/habits/', include('apps.habits.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
]
