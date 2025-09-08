from auditlog.models import AuditLog
from authentication.permissions import IsAdmin
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from admin_panel.models import NewsDetail
from admin_panel.serializers import NewsDetailSerializer


class NewsListView(APIView):
    def get_permissions(self):
        """
        Override to return different permissions based on HTTP method.
        GET requests are allowed for everyone, but POST requires admin.
        """
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def get(self, request):
        """
        List all news items, open to everyone
        """
        news = NewsDetail.objects.all()
        serializer = NewsDetailSerializer(news, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Create a new news item, only for admins
        """
        request_data = request.data.copy()
        if "id" in request_data:
            del request_data["id"]

        latest_news = NewsDetail.objects.order_by("-id").first()
        new_id = 1
        if latest_news:
            new_id = latest_news.id + 1

        request_data["id"] = new_id

        serializer = NewsDetailSerializer(data=request_data)
        if serializer.is_valid():
            if request_data.get("image_url"):
                image_path = request_data["image_url"]
                from django.conf import settings

                media_url = settings.MEDIA_URL.rstrip("/")
                if image_path.startswith(media_url):
                    image_path = image_path[len(media_url) :]
                serializer.validated_data["image"] = image_path.lstrip("/")
            elif "image" in request.FILES:
                serializer.validated_data["image"] = request.FILES["image"]

            news = serializer.save()
            AuditLog.objects.create(action=f"New news item created: {news.title}", user=request.user.name, type="news")
            print(f"Successfully created news with ID: {news.id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(f"Invalid news data. Errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NewsDetailView(APIView):
    def get_permissions(self):
        """
        Override to return different permissions based on HTTP method.
        GET requests are allowed for everyone, but PUT and DELETE require admin.
        """
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def get_object(self, news_id):
        """
        Helper method to get the news detail object
        """
        try:
            return NewsDetail.objects.get(id=news_id)
        except NewsDetail.DoesNotExist:
            return None

    def get(self, request, news_id):
        """
        Retrieve a single news detail, open to everyone
        """
        news = self.get_object(news_id)
        if not news:
            return Response({"error": "News not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = NewsDetailSerializer(news)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, news_id):
        """
        Update a news item, only for admins
        """
        news = self.get_object(news_id)
        if not news:
            return Response({"error": "News not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = NewsDetailSerializer(news, data=request.data, partial=True)
        if serializer.is_valid():
            if request.data.get("image_url"):
                image_path = request.data["image_url"]
                from django.conf import settings

                media_url = settings.MEDIA_URL.rstrip("/")
                if image_path.startswith(media_url):
                    image_path = image_path[len(media_url) :]
                serializer.validated_data["image"] = image_path.lstrip("/")
            elif "image" in request.FILES:
                serializer.validated_data["image"] = request.FILES["image"]

            updated_news = serializer.save()
            AuditLog.objects.create(
                action=f"News item updated: {updated_news.title}", user=request.user.name, type="news"
            )

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, news_id):
        """
        Delete a news item, only for admins
        """
        news = self.get_object(news_id)
        if not news:
            return Response({"error": "News not found"}, status=status.HTTP_404_NOT_FOUND)

        news_title = news.title
        AuditLog.objects.create(action=f"News item deleted: {news_title}", user=request.user.name, type="news")

        news.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
