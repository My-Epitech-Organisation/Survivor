from rest_framework import serializers
from django.contrib.auth.models import User
from .models import News, NewsDetail

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_staff', 'is_active', 'date_joined']
        read_only_fields = ['date_joined']

class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = '__all__'

class NewsDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsDetail
        fields = '__all__'
