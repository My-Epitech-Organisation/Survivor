from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_panel_home(request):
    """
    Main view of the admin panel.
    This view will only be accessible to admin users.
    """
    return JsonResponse({
        'message': 'Welcome to the admin panel',
        'status': 'success'
    })
