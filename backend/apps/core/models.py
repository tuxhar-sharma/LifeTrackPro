import uuid
from django.db import models
from django.utils import timezone

class UUIDModel(models.Model):
    """Abstract base model supplying a primary key UUID."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True

class TimeStampedModel(models.Model):
    """Abstract base model tracking creation and last modification timestamps."""
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class SoftDeletableModel(models.Model):
    """Abstract base model providing soft delete functionality."""
    deleted_at = models.DateTimeField(null=True, blank=True, default=None)

    class Meta:
        abstract = True

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at', 'updated_at'] if hasattr(self, 'updated_at') else ['deleted_at'])

    def restore(self):
        self.deleted_at = None
        self.save(update_fields=['deleted_at', 'updated_at'] if hasattr(self, 'updated_at') else ['deleted_at'])

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

class BaseModel(UUIDModel, TimeStampedModel, SoftDeletableModel):
    """Convenience composite base model."""
    class Meta:
        abstract = True
