from django.urls import path
from .views import CashFlowView, FinancialHealthScoreView, HistoricalTrendsView

urlpatterns = [
    path('cashflow/', CashFlowView.as_view(), name='analytics-cashflow'),
    path('health-score/', FinancialHealthScoreView.as_view(), name='analytics-health-score'),
    path('trends/', HistoricalTrendsView.as_view(), name='analytics-trends'),
]
