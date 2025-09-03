from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.register_user, name='register'),
    path('logout/', views.logout_view, name='logout'),

    # User profile endpoints
    path('profile/', views.get_user_profile, name='user_profile'),
    path('profile/update/', views.update_user_profile, name='update_profile'),

    # Password reset endpoints
    path('password-reset/', views.request_password_reset, name='password_reset'),
]
