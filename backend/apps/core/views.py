import time
from django.db import connection
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

class HealthCheckView(APIView):
    """
    Production health check endpoint for container probes and load balancers.
    Checks database connectivity and latency.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        health_data = {
            'status': 'healthy',
            'version': '1.0.0',
            'service': 'lifetrack-pro-api',
            'timestamp': timezone.now().isoformat(),
            'database': 'unknown',
            'db_latency_ms': None,
        }

        # Verify Database Connection & Latency
        start_time = time.time()
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                row = cursor.fetchone()
                if row and row[0] == 1:
                    latency = round((time.time() - start_time) * 1000, 2)
                    health_data['database'] = 'connected'
                    health_data['db_latency_ms'] = latency
                else:
                    health_data['status'] = 'unhealthy'
                    health_data['database'] = 'unexpected_response'
        except Exception as e:
            health_data['status'] = 'unhealthy'
            health_data['database'] = f'error: {str(e)}'
            return Response(health_data, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response(health_data, status=status.HTTP_200_OK)
