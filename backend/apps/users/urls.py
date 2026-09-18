from django.urls import path
from .views import UserPreferencesView, UserExportDataView

urlpatterns = [
    path('preferences/', UserPreferencesView.as_view(), name='user-preferences'),
    path('export/', UserExportDataView.as_view(), name='user-export'),
]
