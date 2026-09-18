from django.db import models
from django.conf import settings
from apps.core.models import BaseModel

class IncomeSource(BaseModel):
    class StreamType(models.TextChoices):
        SALARY = 'salary', 'Primary Salary / W2'
        FREELANCE = 'freelance', 'Freelance & Contracting'
        BUSINESS = 'business', 'Business & SaaS Revenue'
        INVESTMENT = 'investment', 'Dividends & Capital Gains'
        RENTAL = 'rental', 'Rental & Real Estate'
        OTHER = 'other', 'Other Inflow'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='income_sources'
    )
    name = models.CharField(max_length=120)
    stream_type = models.CharField(max_length=30, choices=StreamType.choices, default=StreamType.SALARY)
    color_hex = models.CharField(max_length=7, default='#10B981')
    icon = models.CharField(max_length=50, default='briefcase')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'income_sources'
        verbose_name = 'Income Source'
        verbose_name_plural = 'Income Sources'
        unique_together = ('user', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_stream_type_display()})"


class Income(BaseModel):
    class RecurrenceInterval(models.TextChoices):
        NONE = 'none', 'One-time'
        WEEKLY = 'weekly', 'Weekly'
        BIWEEKLY = 'biweekly', 'Bi-weekly'
        MONTHLY = 'monthly', 'Monthly'
        QUARTERLY = 'quarterly', 'Quarterly'
        YEARLY = 'yearly', 'Yearly'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='incomes'
    )
    source = models.ForeignKey(
        IncomeSource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='incomes'
    )
    amount_cents = models.BigIntegerField()
    currency = models.CharField(max_length=3, default='USD')
    amount_base_currency_cents = models.BigIntegerField(default=0)
    received_date = models.DateField()
    is_recurring = models.BooleanField(default=False)
    recurrence_interval = models.CharField(
        max_length=20,
        choices=RecurrenceInterval.choices,
        default=RecurrenceInterval.NONE
    )
    payer_name = models.CharField(max_length=150, blank=True, default='')
    notes = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'incomes'
        verbose_name = 'Income'
        verbose_name_plural = 'Incomes'
        ordering = ['-received_date', '-created_at']
        indexes = [
            models.Index(fields=['user', '-received_date']),
            models.Index(fields=['source', '-received_date']),
        ]

    def __str__(self):
        return f"{self.payer_name or 'Income'} - ${self.amount_cents / 100:.2f} ({self.received_date})"

    @property
    def amount(self) -> float:
        return self.amount_cents / 100.0

    def save(self, *args, **kwargs):
        if not self.amount_base_currency_cents:
            self.amount_base_currency_cents = self.amount_cents
        super().save(*args, **kwargs)
