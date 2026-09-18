from django.urls import path
from .views import (
    IncomeSourceListCreateView,
    IncomeSourceDetailView,
    IncomeListCreateView,
    IncomeDetailView,
    IncomeSummaryView,
)

urlpatterns = [
    path('', IncomeListCreateView.as_view(), name='income-list-create'),
    path('<uuid:pk>/', IncomeDetailView.as_view(), name='income-detail'),
    path('sources/', IncomeSourceListCreateView.as_view(), name='income-sources-list-create'),
    path('sources/<uuid:pk>/', IncomeSourceDetailView.as_view(), name='income-source-detail'),
    path('summary/', IncomeSummaryView.as_view(), name='income-summary'),
]
