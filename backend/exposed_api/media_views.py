from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from authentication.permissions import IsAdmin
import base64
import uuid
import os
import re
from django.core.files.base import ContentFile


@api_view(['POST'])
@permission_classes([IsAdmin])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def upload_image(request):
    """
    Upload an image from the frontend to the backend.

    Accepts either:
    1. A multipart/form-data request with a file
    2. A JSON request with a base64 encoded image:
       {
           "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgAB..."
       }
    3. A JSON request with a blob URL (which needs to be converted to a file on the frontend):
       {
           "url": "blob:http://localhost:3001/1ca43542-8d3c-42da-8eae-9eded4e53b55"
       }
       Note: For blob URLs, the frontend should convert the blob to a File/FormData before sending

    Output:
    {
        "url": "/media/images/filename.jpg"
    }

    Only accessible by admin users.
    """
    try:
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'images')
        os.makedirs(upload_dir, exist_ok=True)

        if request.content_type.startswith('multipart/form-data'):
            if 'file' not in request.FILES:
                return Response({'error': 'No file was provided'}, status=status.HTTP_400_BAD_REQUEST)

            uploaded_file = request.FILES['file']
            ext = uploaded_file.name.split('.')[-1] if '.' in uploaded_file.name else 'jpg'
            filename = f"{uuid.uuid4()}.{ext}"

            file_path = os.path.join(upload_dir, filename)
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

        else:
            data = request.data

            if 'url' not in data:
                return Response({'error': 'URL is required in JSON format'}, status=status.HTTP_400_BAD_REQUEST)

            if data['url'].startswith('data:'):
                format, imgstr = data['url'].split(';base64,')
                ext = format.split('/')[-1]
                filename = f"{uuid.uuid4()}.{ext}"
                decoded_data = base64.b64decode(imgstr)

                file_path = os.path.join(upload_dir, filename)
                with open(file_path, 'wb') as f:
                    f.write(decoded_data)

            elif data['url'].startswith('blob:'):
                return Response({
                    'error': 'Blob URLs cannot be processed directly. Convert the blob to a File or FormData on the frontend.',
                    'instructions': 'Use fetch(blobUrl).then(r => r.blob()).then(blobData => { const formData = new FormData(); formData.append("file", blobData, "filename.jpg"); })'
                }, status=status.HTTP_400_BAD_REQUEST)

            else:
                return Response(
                    {'error': 'The URL format is not supported. Use base64 encoded data URL or send the file directly.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        media_url = f"{settings.MEDIA_URL.rstrip('/')}/images/{filename}"
        return Response({'url': media_url}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
