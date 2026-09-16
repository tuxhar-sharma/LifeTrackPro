from datetime import date, datetime
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ExpenseCategory, Expense, Budget
from .serializers import ExpenseCategorySerializer, ExpenseSerializer, BudgetSerializer

DEFAULT_CATEGORIES = [
    {"name": "Food & Dining", "icon": "utensils", "color_hex": "#F59E0B"},
    {"name": "Housing & Rent", "icon": "home", "color_hex": "#3B82F6"},
    {"name": "Transportation", "icon": "car", "color_hex": "#10B981"},
    {"name": "Utilities & Bills", "icon": "zap", "color_hex": "#EC4899"},
    {"name": "Entertainment", "icon": "film", "color_hex": "#8B5CF6"},
    {"name": "Shopping & Lifestyle", "icon": "shopping-bag", "color_hex": "#F43F5E"},
    {"name": "Health & Fitness", "icon": "heart-pulse", "color_hex": "#14B8A6"},
    {"name": "Education & Work", "icon": "book-open", "color_hex": "#6366F1"},
]

def ensure_default_categories(user):
    """Seed standard categories for a new user if they have none."""
    if not ExpenseCategory.objects.filter(user=user).exists():
        ExpenseCategory.objects.bulk_create([
            ExpenseCategory(
                user=user,
                name=cat["name"],
                icon=cat["icon"],
                color_hex=cat["color_hex"],
                is_system=True
            )
            for cat in DEFAULT_CATEGORIES
        ])

class ExpenseCategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ensure_default_categories(self.request.user)
        return ExpenseCategory.objects.filter(user=self.request.user, deleted_at__isnull=True).order_by('name')


class ExpenseCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ExpenseCategory.objects.filter(user=self.request.user, deleted_at__isnull=True)

    def perform_destroy(self, instance):
        instance.soft_delete()


class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Expense.objects.filter(user=self.request.user, deleted_at__isnull=True).select_related('category')
        
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)

        start_date = self.request.query_params.get('start_date')
        if start_date:
            qs = qs.filter(transaction_date__gte=start_date)

        end_date = self.request.query_params.get('end_date')
        if end_date:
            qs = qs.filter(transaction_date__lte=end_date)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(merchant_name__icontains=search) | Q(notes__icontains=search)
            )

        is_recurring = self.request.query_params.get('is_recurring')
        if is_recurring is not None:
            qs = qs.filter(is_recurring=is_recurring.lower() in ('true', '1'))

        return qs.order_by('-transaction_date', '-created_at')


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user, deleted_at__isnull=True)

    def perform_destroy(self, instance):
        instance.soft_delete()


class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(
            user=self.request.user,
            deleted_at__isnull=True
        ).select_related('category').order_by('period_start', 'category__name')


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user, deleted_at__isnull=True)

    def perform_destroy(self, instance):
        instance.soft_delete()


class ExpenseSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        
        # Default to current calendar month
        first_of_month = today.replace(day=1)
        start_date_str = request.query_params.get('start_date', str(first_of_month))
        end_date_str = request.query_params.get('end_date', str(today))

        expenses = Expense.objects.filter(
            user=user,
            transaction_date__gte=start_date_str,
            transaction_date__lte=end_date_str,
            deleted_at__isnull=True
        )

        total_agg = expenses.aggregate(
            total_cents=Sum('amount_cents'),
            count=Count('id')
        )
        total_cents = total_agg['total_cents'] or 0
        count = total_agg['count'] or 0

        # Category breakdown
        breakdown_rows = (
            expenses
            .values('category__id', 'category__name', 'category__color_hex', 'category__icon')
            .annotate(cat_total_cents=Sum('amount_cents'))
            .order_by('-cat_total_cents')
        )

        category_breakdown = []
        for r in breakdown_rows:
            cat_cents = r['cat_total_cents'] or 0
            category_breakdown.append({
                'category_id': r['category__id'],
                'category_name': r['category__name'] or 'Uncategorized',
                'category_color': r['category__color_hex'] or '#94A3B8',
                'category_icon': r['category__icon'] or 'folder',
                'total_cents': cat_cents,
                'total': cat_cents / 100.0,
                'percentage': round((cat_cents / total_cents * 100), 1) if total_cents > 0 else 0.0
            })

        # Active Budgets
        active_budgets = Budget.objects.filter(
            user=user,
            period_start__lte=today,
            period_end__gte=today,
            deleted_at__isnull=True
        ).select_related('category')
        budget_serializer = BudgetSerializer(active_budgets, many=True, context={'request': request})

        # Recent 5 expenses
        recent_expenses = ExpenseSerializer(
            expenses.order_by('-transaction_date', '-created_at')[:5],
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
            'category_breakdown': category_breakdown,
            'active_budgets': budget_serializer.data,
            'recent_expenses': recent_expenses,
        })
