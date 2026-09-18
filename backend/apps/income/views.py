from datetime import date
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import IncomeSource, Income
from .serializers import IncomeSourceSerializer, IncomeSerializer

DEFAULT_INCOME_SOURCES = [
    {"name": "Primary Salary / W2", "stream_type": "salary", "icon": "briefcase", "color_hex": "#10B981"},
    {"name": "Consulting & Freelance", "stream_type": "freelance", "icon": "laptop", "color_hex": "#3B82F6"},
    {"name": "Dividends & Investments", "stream_type": "investment", "icon": "trending-up", "color_hex": "#8B5CF6"},
    {"name": "Digital & Side Business", "stream_type": "business", "icon": "store", "color_hex": "#EC4899"},
]

def ensure_default_income_sources(user):
    """Seed standard income streams if user has none."""
    if not IncomeSource.objects.filter(user=user).exists():
        IncomeSource.objects.bulk_create([
            IncomeSource(
                user=user,
                name=src["name"],
                stream_type=src["stream_type"],
                icon=src["icon"],
                color_hex=src["color_hex"]
            )
            for src in DEFAULT_INCOME_SOURCES
        ])


class IncomeSourceListCreateView(generics.ListCreateAPIView):
    serializer_class = IncomeSourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ensure_default_income_sources(self.request.user)
        return IncomeSource.objects.filter(
            user=self.request.user,
            deleted_at__isnull=True,
            is_active=True
        ).order_by('name')


class IncomeSourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IncomeSourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return IncomeSource.objects.filter(user=self.request.user, deleted_at__isnull=True)

    def perform_destroy(self, instance):
        instance.soft_delete()


class IncomeListCreateView(generics.ListCreateAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Income.objects.filter(
            user=self.request.user,
            deleted_at__isnull=True
        ).select_related('source')

        source_id = self.request.query_params.get('source')
        if source_id:
            qs = qs.filter(source_id=source_id)

        stream_type = self.request.query_params.get('stream_type')
        if stream_type:
            qs = qs.filter(source__stream_type=stream_type)

        start_date = self.request.query_params.get('start_date')
        if start_date:
            qs = qs.filter(received_date__gte=start_date)

        end_date = self.request.query_params.get('end_date')
        if end_date:
            qs = qs.filter(received_date__lte=end_date)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(payer_name__icontains=search) | Q(notes__icontains=search)
            )

        is_recurring = self.request.query_params.get('is_recurring')
        if is_recurring is not None:
            qs = qs.filter(is_recurring=is_recurring.lower() in ('true', '1'))

        return qs.order_by('-received_date', '-created_at')


class IncomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user, deleted_at__isnull=True)

    def perform_destroy(self, instance):
        instance.soft_delete()


class IncomeSummaryView(APIView):
    """Delivers month-to-date and period aggregated inflow analytics."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        first_of_month = today.replace(day=1)

        start_date_str = request.query_params.get('start_date', str(first_of_month))
        end_date_str = request.query_params.get('end_date', str(today))

        incomes = Income.objects.filter(
            user=user,
            received_date__gte=start_date_str,
            received_date__lte=end_date_str,
            deleted_at__isnull=True
        )

        total_agg = incomes.aggregate(
            total_cents=Sum('amount_cents'),
            count=Count('id')
        )
        total_cents = total_agg['total_cents'] or 0
        count = total_agg['count'] or 0

        # Source breakdown
        breakdown_rows = (
            incomes
            .values('source__id', 'source__name', 'source__color_hex', 'source__icon', 'source__stream_type')
            .annotate(source_total_cents=Sum('amount_cents'))
            .order_by('-source_total_cents')
        )

        source_breakdown = []
        for r in breakdown_rows:
            src_cents = r['source_total_cents'] or 0
            source_breakdown.append({
                'source_id': r['source__id'],
                'source_name': r['source__name'] or 'Uncategorized',
                'source_color': r['source__color_hex'] or '#10B981',
                'source_icon': r['source__icon'] or 'briefcase',
                'stream_type': r['source__stream_type'] or 'other',
                'total_cents': src_cents,
                'total': src_cents / 100.0,
                'percentage': round((src_cents / total_cents * 100), 1) if total_cents > 0 else 0.0
            })

        # Recurring vs One-time
        recurring_cents = incomes.filter(is_recurring=True).aggregate(t=Sum('amount_cents'))['t'] or 0

        # Recent 5 incomes
        recent_incomes = IncomeSerializer(
            incomes.order_by('-received_date', '-created_at')[:5],
            many=True,
            context={'request': request}
        ).data

        return Response({
            'period': {
                'start_date': start_date_str,
                'end_date': end_date_str,
            },
            'total_cents': total_cents,
            'total': total_cents / 100.0,
            'count': count,
            'recurring_total_cents': recurring_cents,
            'recurring_total': recurring_cents / 100.0,
            'source_breakdown': source_breakdown,
            'recent_incomes': recent_incomes,
        })
