from django.http import JsonResponse
from django.db import connection
from django.db.utils import OperationalError

def health_check(request):
    """
    Endpoint for checking the health of the application and its connection to the database
    """
    try:
        # Try to query the database
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            one = cursor.fetchone()[0]
            if one != 1:
                raise Exception("Database query returned unexpected result")

        return JsonResponse({
            "status": "healthy",
            "message": "Database connection is working properly",
            "database": True
        })
    except OperationalError:
        return JsonResponse({
            "status": "unhealthy",
            "message": "Database connection failed",
            "database": False
        }, status=503)
            "message": "Internal server error",
            "database": False
        }, status=500)
