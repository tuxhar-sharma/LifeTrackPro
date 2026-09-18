import os
from django.core.exceptions import ImproperlyConfigured
from .base import *

DEBUG = False

if not os.getenv('SECRET_KEY') or os.getenv('SECRET_KEY') == 'django-insecure-lifetrack-pro-production-secret-key-fallback':
    raise ImproperlyConfigured("CRITICAL: The SECRET_KEY environment variable must be set in production.")

CORS_ALLOW_ALL_ORIGINS = False

# Security headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
