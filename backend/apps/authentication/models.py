from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from apps.core.models import BaseModel

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('status', 'active')
        extra_fields.setdefault('tier', 'enterprise')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin, BaseModel):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        PENDING_VERIFICATION = 'pending_verification', 'Pending Verification'
        SUSPENDED = 'suspended', 'Suspended'
        DEACTIVATED = 'deactivated', 'Deactivated'

    class Tier(models.TextChoices):
        FREE = 'free', 'Free'
        PRO = 'pro', 'Pro'
        AI_POWER = 'ai_power', 'AI Power'
        ENTERPRISE = 'enterprise', 'Enterprise'

    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=100, blank=True, default='')
    last_name = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.ACTIVE)
    tier = models.CharField(max_length=30, choices=Tier.choices, default=Tier.FREE)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=128, blank=True, null=True)

    avatar_url = models.URLField(max_length=500, blank=True, default='')
    password_reset_token = models.CharField(max_length=128, blank=True, null=True)
    password_reset_sent_at = models.DateTimeField(null=True, blank=True)

    failed_login_attempts = models.PositiveIntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    last_login_at = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.email} ({self.tier})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email
