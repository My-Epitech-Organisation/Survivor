from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    DriveFolderViewSet, DriveFileViewSet, DriveShareViewSet,
    DriveActivityViewSet, SharedItemView, SharedFileDownloadView,
    StartupStorageStatsView
)

router = DefaultRouter()
router.register(r'folders', DriveFolderViewSet)
router.register(r'files', DriveFileViewSet)
router.register(r'shares', DriveShareViewSet)
router.register(r'activities', DriveActivityViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('stats/<int:startup_id>/', StartupStorageStatsView.as_view(), name='drive-stats'),
    path('share/<str:token>/', SharedItemView.as_view(), name='shared-item'),
    path('share/<str:token>/download/', SharedFileDownloadView.as_view(), name='download-shared-file'),
    path('share/<str:token>/download/<int:file_id>/', SharedFileDownloadView.as_view(), name='download-shared-folder-file'),
]
