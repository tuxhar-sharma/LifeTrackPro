from django.db import models
from django.conf import settings
from apps.core.models import BaseModel

class ExpenseCategory(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expense_categories'
    )
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, default='folder')
    color_hex = models.CharField(max_length=7, default='#6366F1')
    is_system = models.BooleanField(default=False)

    class Meta:
        db_table = 'expense_categories'
        verbose_name = 'Expense Category'
        verbose_name_plural = 'Expense Categories'
        unique_together = ('user', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.user.email})"


class Expense(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expenses'
    )
    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses'
    )
    amount_cents = models.BigIntegerField()
    currency = models.CharField(max_length=3, default='USD')
    amount_base_currency_cents = models.BigIntegerField(default=0)
    merchant_name = models.CharField(max_length=150)
    transaction_date = models.DateField()
    payment_method = models.CharField(max_length=50, default='credit_card')
    is_recurring = models.BooleanField(default=False)
    is_tax_deductible = models.BooleanField(default=False)
    notes = models.TextField(blank=True, default='')
    receipt_url = models.URLField(blank=True, null=True)

    class Meta:
        db_table = 'expenses'
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'
        ordering = ['-transaction_date', '-created_at']
        indexes = [
            models.Index(fields=['user', '-transaction_date']),
            models.Index(fields=['category', '-transaction_date']),
        ]

    def __str__(self):
        return f"{self.merchant_name} - ${self.amount_cents / 100:.2f} ({self.transaction_date})"

    @property
    def amount(self) -> float:
        return self.amount_cents / 100.0

    def save(self, *args, **kwargs):
        if not self.amount_base_currency_cents:
            self.amount_base_currency_cents = self.amount_cents
        super().save(*args, **kwargs)


class Budget(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    limit_cents = models.BigIntegerField()
    period_start = models.DateField()
    period_end = models.DateField()
    rollover_enabled = models.BooleanField(default=False)

    class Meta:
        db_table = 'budgets'
        verbose_name = 'Budget'
        verbose_name_plural = 'Budgets'
        unique_together = ('user', 'category', 'period_start', 'period_end')
        ordering = ['period_start', 'category__name']

    def __str__(self):
        return f"{self.category.name} Budget (${self.limit_cents / 100:.2f}) {self.period_start} to {self.period_end}"

    @property
    def limit(self) -> float:
        return self.limit_cents / 100.0
