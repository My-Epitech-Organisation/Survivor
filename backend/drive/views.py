import mimetypes
import os
import secrets
import uuid
from wsgiref.util import FileWrapper

from django.conf import settings
from django.db.models import Q, Sum
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_panel.models import StartupDetail
from authentication.permissions import IsFounder

from .models import DriveFolder, DriveFile, DriveShare, DriveActivity
from .serializers import (
    DriveFolderSerializer, DriveFileSerializer, DriveShareSerializer,
    DriveActivitySerializer, DriveFolderListSerializer, DriveFileListSerializer,
    FileUploadSerializer
)


class StartupDrivePermission(permissions.BasePermission):
    """
    Custom permission to check if user has access to a startup's drive.
    """

    def has_permission(self, request, view):
        # Allow read permissions for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        # Write permissions are only allowed to authenticated users
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Check if the user is admin or staff
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Get the startup from the object
        startup = None
        if isinstance(obj, DriveFolder):
            startup = obj.startup
        elif isinstance(obj, DriveFile):
            startup = obj.startup
        elif isinstance(obj, DriveShare):
            if obj.file:
                startup = obj.file.startup
            elif obj.folder:
                startup = obj.folder.startup
        elif isinstance(obj, StartupDetail):
            startup = obj

        # If no startup is found, deny access
        if not startup:
            return False

        # Check if the user is a founder of the startup
        if request.user.role == 'founder' and request.user.founder_id:
            # Check if the user's founder_id is in the startup's founders
            return startup.founders.filter(id=request.user.founder_id).exists()

        # Admin users can access any startup's drive
        return request.user.role == 'admin'


class DriveFolderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing folders in the drive system.
    """
    queryset = DriveFolder.objects.all()
    serializer_class = DriveFolderSerializer
    permission_classes = [permissions.IsAuthenticated, StartupDrivePermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'list':
            return DriveFolderListSerializer
        return DriveFolderSerializer

    def get_queryset(self):
        """
        Filter folders based on user permissions and query parameters.
        """
        queryset = DriveFolder.objects.all()

        # Filter by startup if specified
        startup_id = self.request.query_params.get('startup', None)
        if startup_id:
            queryset = queryset.filter(startup_id=startup_id)

        # Filter by parent folder if specified
        parent_id = self.request.query_params.get('parent', None)
        if parent_id:
            if parent_id == 'null':  # Root folders
                queryset = queryset.filter(parent__isnull=True)
            else:
                queryset = queryset.filter(parent_id=parent_id)

        # If user is not admin/staff, filter by startups they have access to
        user = self.request.user
        if not (user.is_staff or user.is_superuser):
            if user.role == 'founder' and user.founder_id:
                # Get startups where user is a founder
                accessible_startups = StartupDetail.objects.filter(
                    founders__id=user.founder_id
                ).values_list('id', flat=True)
                queryset = queryset.filter(startup_id__in=accessible_startups)
            else:
                # No access to any startups
                queryset = queryset.none()

        return queryset

    def perform_create(self, serializer):
        """
        Create a new folder and log the activity.
        """
        folder = serializer.save(created_by=self.request.user)

        # Log activity
        DriveActivity.objects.create(
            startup=folder.startup,
            user=self.request.user,
            folder=folder,
            action='create_folder',
            details={'name': folder.name},
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

    def perform_update(self, serializer):
        """
        Update a folder and log the activity.
        """
        original_name = serializer.instance.name
        original_parent = serializer.instance.parent

        folder = serializer.save()

        # Log activity if name or parent changed
        details = {}
        action = None

        if original_name != folder.name:
            details['old_name'] = original_name
            details['new_name'] = folder.name
            action = 'rename'

        if original_parent != folder.parent:
            details['old_parent'] = original_parent.id if original_parent else None
            details['new_parent'] = folder.parent.id if folder.parent else None
            action = 'move'

        if action:
            DriveActivity.objects.create(
                startup=folder.startup,
                user=self.request.user,
                folder=folder,
                action=action,
                details=details,
                ip_address=self.request.META.get('REMOTE_ADDR')
            )

    def perform_destroy(self, instance):
        """
        Delete a folder and log the activity.
        """
        startup = instance.startup
        folder_name = instance.name

        # Log activity before deletion
        DriveActivity.objects.create(
            startup=startup,
            user=self.request.user,
            action='delete',
            details={'folder_name': folder_name, 'folder_id': instance.id},
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

        instance.delete()


class DriveFileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing files in the drive system.
    """
    queryset = DriveFile.objects.all()
    serializer_class = DriveFileSerializer
    permission_classes = [permissions.IsAuthenticated, StartupDrivePermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'uploaded_at', 'size']
    ordering = ['-uploaded_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return DriveFileListSerializer
        return DriveFileSerializer

    def get_queryset(self):
        """
        Filter files based on user permissions and query parameters.
        """
        queryset = DriveFile.objects.all()

        # By default, don't show archived files unless specified
        show_archived = self.request.query_params.get('archived', 'false').lower() == 'true'
        if not show_archived:
            queryset = queryset.filter(is_archived=False)

        # Filter by startup if specified
        startup_id = self.request.query_params.get('startup', None)
        if startup_id:
            queryset = queryset.filter(startup_id=startup_id)

        # Filter by folder if specified
        folder_id = self.request.query_params.get('folder', None)
        if folder_id:
            if folder_id == 'null':  # Root files
                queryset = queryset.filter(folder__isnull=True)
            else:
                queryset = queryset.filter(folder_id=folder_id)

        # Filter by file type if specified
        file_type = self.request.query_params.get('type', None)
        if file_type:
            queryset = queryset.filter(file_type__startswith=file_type)

        # If user is not admin/staff, filter by startups they have access to
        user = self.request.user
        if not (user.is_staff or user.is_superuser):
            if user.role == 'founder' and user.founder_id:
                # Get startups where user is a founder
                accessible_startups = StartupDetail.objects.filter(
                    founders__id=user.founder_id
                ).values_list('id', flat=True)
                queryset = queryset.filter(startup_id__in=accessible_startups)
            else:
                # No access to any startups
                queryset = queryset.none()

        return queryset

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download a file.
        """
        file_obj = self.get_object()

        # Log download activity
        DriveActivity.objects.create(
            startup=file_obj.startup,
            user=request.user,
            file=file_obj,
            action='download',
            ip_address=request.META.get('REMOTE_ADDR')
        )

        # Get the file path
        file_path = file_obj.file.path

        # Prepare the response
        content_type, encoding = mimetypes.guess_type(file_path)
        content_type = content_type or 'application/octet-stream'

        response = HttpResponse(FileWrapper(open(file_path, 'rb')), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{file_obj.name}"'
        response['Content-Length'] = os.path.getsize(file_path)

        return response

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload(self, request):
        """
        Upload a new file.
        """
        serializer = FileUploadSerializer(data=request.data)
        if serializer.is_valid():
            # Get the uploaded file
            uploaded_file = serializer.validated_data['file']
            folder = serializer.validated_data.get('folder', None)
            description = serializer.validated_data.get('description', '')

            # Get startup ID from query parameters or folder
            startup_id = request.query_params.get('startup')
            if not startup_id and folder:
                startup_id = folder.startup_id

            if not startup_id:
                return Response(
                    {'error': 'Startup ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if the user has permission to upload to this startup
            startup = get_object_or_404(StartupDetail, id=startup_id)
            if not StartupDrivePermission().has_object_permission(request, self, startup):
                return Response(
                    {'error': 'You do not have permission to upload files to this startup'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Check if a file with the same name already exists in the same folder
            existing_file = DriveFile.objects.filter(
                startup_id=startup_id,
                folder=folder,
                name=uploaded_file.name
            ).first()

            if existing_file:
                return Response(
                    {'error': f'A file with the name "{uploaded_file.name}" already exists in this folder'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Determine the file type (MIME type)
            content_type, encoding = mimetypes.guess_type(uploaded_file.name)
            content_type = content_type or 'application/octet-stream'

            # Create the file object
            file_obj = DriveFile.objects.create(
                startup_id=startup_id,
                folder=folder,
                name=uploaded_file.name,
                file=uploaded_file,
                size=uploaded_file.size,
                file_type=content_type,
                uploaded_by=request.user,
                description=description
            )

            # Log the upload activity
            DriveActivity.objects.create(
                startup=file_obj.startup,
                user=request.user,
                file=file_obj,
                action='upload',
                details={'size': file_obj.size, 'file_type': file_obj.file_type},
                ip_address=request.META.get('REMOTE_ADDR')
            )

            # Return the serialized file object
            return Response(
                DriveFileSerializer(file_obj, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """
        Archive a file.
        """
        file_obj = self.get_object()
        file_obj.is_archived = True
        file_obj.save()

        # Log archive activity
        DriveActivity.objects.create(
            startup=file_obj.startup,
            user=request.user,
            file=file_obj,
            action='delete',  # Using 'delete' since archiving is a soft delete
            details={'archived': True},
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        Restore an archived file.
        """
        file_obj = self.get_object()
        file_obj.is_archived = False
        file_obj.save()

        # Log restore activity
        DriveActivity.objects.create(
            startup=file_obj.startup,
            user=request.user,
            file=file_obj,
            action='restore',
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_update(self, serializer):
        """
        Update a file and log the activity.
        """
        original_name = serializer.instance.name
        original_folder = serializer.instance.folder

        file_obj = serializer.save()

        # Log activity if name or folder changed
        details = {}
        action = None

        if original_name != file_obj.name:
            details['old_name'] = original_name
            details['new_name'] = file_obj.name
            action = 'rename'

        if original_folder != file_obj.folder:
            details['old_folder'] = original_folder.id if original_folder else None
            details['new_folder'] = file_obj.folder.id if file_obj.folder else None
            action = 'move'

        if action:
            DriveActivity.objects.create(
                startup=file_obj.startup,
                user=self.request.user,
                file=file_obj,
                action=action,
                details=details,
                ip_address=self.request.META.get('REMOTE_ADDR')
            )

    def perform_destroy(self, instance):
        """
        Permanently delete a file and log the activity.
        """
        startup = instance.startup
        file_name = instance.name

        # Log activity before deletion
        DriveActivity.objects.create(
            startup=startup,
            user=self.request.user,
            action='delete',
            details={'file_name': file_name, 'file_id': instance.id, 'permanent': True},
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

        # Delete the actual file from storage
        instance.file.delete(save=False)
        instance.delete()


class DriveShareViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing file and folder shares.
    """
    queryset = DriveShare.objects.all()
    serializer_class = DriveShareSerializer
    permission_classes = [permissions.IsAuthenticated, StartupDrivePermission]

    def get_queryset(self):
        """
        Filter shares based on user permissions and query parameters.
        """
        queryset = DriveShare.objects.all()

        # Filter by file if specified
        file_id = self.request.query_params.get('file', None)
        if file_id:
            queryset = queryset.filter(file_id=file_id)

        # Filter by folder if specified
        folder_id = self.request.query_params.get('folder', None)
        if folder_id:
            queryset = queryset.filter(folder_id=folder_id)

        # Filter by active status if specified
        active = self.request.query_params.get('active', None)
        if active is not None:
            is_active = active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)

        # If user is not admin/staff, filter by shares they created
        user = self.request.user
        if not (user.is_staff or user.is_superuser):
            if user.role == 'founder' and user.founder_id:
                # Get startups where user is a founder
                accessible_startups = StartupDetail.objects.filter(
                    founders__id=user.founder_id
                ).values_list('id', flat=True)

                # Filter shares by file.startup or folder.startup in accessible_startups
                queryset = queryset.filter(
                    Q(file__startup_id__in=accessible_startups) |
                    Q(folder__startup_id__in=accessible_startups)
                )
            else:
                # No access to any startups' shares
                queryset = queryset.none()

        return queryset

    def perform_create(self, serializer):
        """
        Create a new share and generate an access token.
        """
        # Generate a random access token
        access_token = secrets.token_urlsafe(32)

        share = serializer.save(
            shared_by=self.request.user,
            access_token=access_token
        )

        # Log sharing activity
        startup = None
        item_type = None
        item_id = None

        if share.file:
            startup = share.file.startup
            item_type = 'file'
            item_id = share.file.id
        elif share.folder:
            startup = share.folder.startup
            item_type = 'folder'
            item_id = share.folder.id

        if startup:
            DriveActivity.objects.create(
                startup=startup,
                user=self.request.user,
                file=share.file,
                folder=share.folder,
                action='share',
                details={
                    'item_type': item_type,
                    'item_id': item_id,
                    'expires_at': share.expires_at.isoformat() if share.expires_at else None
                },
                ip_address=self.request.META.get('REMOTE_ADDR')
            )

    def perform_update(self, serializer):
        """
        Update a share and log the activity.
        """
        # Only allow updating expires_at and is_active fields
        share = serializer.save()

        # Log unshare activity if the share was deactivated
        if 'is_active' in serializer.validated_data and not share.is_active:
            startup = None
            if share.file:
                startup = share.file.startup
            elif share.folder:
                startup = share.folder.startup

            if startup:
                DriveActivity.objects.create(
                    startup=startup,
                    user=self.request.user,
                    file=share.file,
                    folder=share.folder,
                    action='unshare',
                    ip_address=self.request.META.get('REMOTE_ADDR')
                )

    def perform_destroy(self, instance):
        """
        Delete a share and log the activity.
        """
        startup = None
        if instance.file:
            startup = instance.file.startup
        elif instance.folder:
            startup = instance.folder.startup

        # Log unshare activity before deletion
        if startup:
            DriveActivity.objects.create(
                startup=startup,
                user=self.request.user,
                file=instance.file,
                folder=instance.folder,
                action='unshare',
                details={'deleted': True},
                ip_address=self.request.META.get('REMOTE_ADDR')
            )

        instance.delete()


class SharedItemView(APIView):
    """
    API endpoint for accessing shared items via token.
    No authentication required as this is accessed via a share token.
    """
    permission_classes = []  # No authentication required

    def get(self, request, token):
        """
        Get details about a shared item and allow download if it's a file.
        """
        # Find the share by token
        share = get_object_or_404(
            DriveShare,
            access_token=token,
            is_active=True
        )

        # Check if the share has expired
        if share.expires_at and timezone.now() > share.expires_at:
            return Response(
                {'error': 'This share has expired'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Return information about the shared item
        response_data = {
            'id': share.id,
            'shared_by': share.shared_by.name if share.shared_by else None,
            'shared_at': share.shared_at,
            'expires_at': share.expires_at
        }

        if share.file:
            response_data['type'] = 'file'
            response_data['file'] = {
                'id': share.file.id,
                'name': share.file.name,
                'size': share.file.size,
                'file_type': share.file.file_type,
                'uploaded_at': share.file.uploaded_at
            }
            # Add download URL
            response_data['download_url'] = f'/api/drive/share/{token}/download/'

        elif share.folder:
            response_data['type'] = 'folder'
            response_data['folder'] = {
                'id': share.folder.id,
                'name': share.folder.name,
                'created_at': share.folder.created_at
            }

            # Get files in this folder
            files = DriveFile.objects.filter(
                folder=share.folder,
                is_archived=False
            )
            response_data['files'] = [
                {
                    'id': file.id,
                    'name': file.name,
                    'size': file.size,
                    'file_type': file.file_type,
                    'uploaded_at': file.uploaded_at,
                    'download_url': f'/api/drive/share/{token}/download/{file.id}/'
                }
                for file in files
            ]

        return Response(response_data)

    def get_shared_file(self, token, file_id=None):
        """
        Helper method to get a shared file.
        """
        share = get_object_or_404(
            DriveShare,
            access_token=token,
            is_active=True
        )

        # Check if the share has expired
        if share.expires_at and timezone.now() > share.expires_at:
            return None, 'expired'

        if share.file and not file_id:
            # Direct file share
            return share.file, None

        if share.folder and file_id:
            # Folder share, check if the file is in this folder
            try:
                file = DriveFile.objects.get(
                    id=file_id,
                    folder=share.folder,
                    is_archived=False
                )
                return file, None
            except DriveFile.DoesNotExist:
                return None, 'not_found'

        return None, 'invalid'


class SharedFileDownloadView(SharedItemView):
    """
    API endpoint for downloading a shared file.
    """
    def get(self, request, token, file_id=None):
        """
        Download a shared file.
        """
        file_obj, error = self.get_shared_file(token, file_id)

        if error:
            if error == 'expired':
                return Response(
                    {'error': 'This share has expired'},
                    status=status.HTTP_403_FORBIDDEN
                )
            elif error == 'not_found':
                return Response(
                    {'error': 'File not found in shared folder'},
                    status=status.HTTP_404_NOT_FOUND
                )
            else:
                return Response(
                    {'error': 'Invalid share'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if not file_obj:
            return Response(
                {'error': 'No file available for download'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the file path
        file_path = file_obj.file.path

        # Prepare the response
        content_type, encoding = mimetypes.guess_type(file_path)
        content_type = content_type or 'application/octet-stream'

        response = HttpResponse(FileWrapper(open(file_path, 'rb')), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{file_obj.name}"'
        response['Content-Length'] = os.path.getsize(file_path)

        # Log anonymous download
        DriveActivity.objects.create(
            startup=file_obj.startup,
            file=file_obj,
            action='download',
            details={'shared': True},
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return response


class DriveActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing drive activity logs.
    Read-only, as activities should only be created automatically.
    """
    queryset = DriveActivity.objects.all()
    serializer_class = DriveActivitySerializer
    permission_classes = [permissions.IsAuthenticated, StartupDrivePermission]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']

    def get_queryset(self):
        """
        Filter activities based on user permissions and query parameters.
        """
        queryset = DriveActivity.objects.all()

        # Filter by startup if specified
        startup_id = self.request.query_params.get('startup', None)
        if startup_id:
            queryset = queryset.filter(startup_id=startup_id)

        # Filter by user if specified
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # Filter by action if specified
        action = self.request.query_params.get('action', None)
        if action:
            queryset = queryset.filter(action=action)

        # Filter by date range if specified
        start_date = self.request.query_params.get('start_date', None)
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)

        end_date = self.request.query_params.get('end_date', None)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)

        # If user is not admin/staff, filter by startups they have access to
        user = self.request.user
        if not (user.is_staff or user.is_superuser):
            if user.role == 'founder' and user.founder_id:
                # Get startups where user is a founder
                accessible_startups = StartupDetail.objects.filter(
                    founders__id=user.founder_id
                ).values_list('id', flat=True)
                queryset = queryset.filter(startup_id__in=accessible_startups)
            else:
                # No access to any startups
                queryset = queryset.none()

        return queryset


class StartupStorageStatsView(APIView):
    """
    API endpoint for getting storage statistics for a startup.
    """
    permission_classes = [permissions.IsAuthenticated, StartupDrivePermission]

    def get(self, request, startup_id):
        """
        Get storage statistics for a startup.
        """
        startup = get_object_or_404(StartupDetail, id=startup_id)

        # Check permissions
        if not StartupDrivePermission().has_object_permission(request, self, startup):
            return Response(
                {'error': 'You do not have permission to access this startup'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all files for the startup
        files = DriveFile.objects.filter(startup=startup)

        # Calculate total storage used
        total_size = files.aggregate(total=Sum('size'))['total'] or 0

        # Count files by type
        file_types = {}
        for file in files:
            main_type = file.file_type.split('/')[0]
            if main_type in file_types:
                file_types[main_type]['count'] += 1
                file_types[main_type]['size'] += file.size
            else:
                file_types[main_type] = {
                    'count': 1,
                    'size': file.size
                }

        # Calculate human-readable size
        human_size = total_size
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if human_size < 1024 or unit == 'TB':
                human_size = f"{human_size:.2f} {unit}"
                break
            human_size /= 1024

        # Get counts
        total_files = files.count()
        active_files = files.filter(is_archived=False).count()
        archived_files = files.filter(is_archived=True).count()
        total_folders = DriveFolder.objects.filter(startup=startup).count()

        # Get recent activities
        recent_activities = DriveActivity.objects.filter(
            startup=startup
        ).order_by('-timestamp')[:10]

        return Response({
            'startup_id': startup.id,
            'startup_name': startup.name,
            'storage': {
                'total_size': total_size,
                'human_size': human_size,
                'file_types': file_types
            },
            'counts': {
                'total_files': total_files,
                'active_files': active_files,
                'archived_files': archived_files,
                'total_folders': total_folders
            },
            'recent_activities': DriveActivitySerializer(recent_activities, many=True).data
        })
