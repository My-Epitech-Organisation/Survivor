from rest_framework import serializers
from django.contrib.auth.models import User
from .models import News, NewsDetail, Event, StartupList, StartupDetail, Founder, Partner

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

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class StartupListSerializer(serializers.ModelSerializer):
    class Meta:
        model = StartupList
        fields = '__all__'

class FounderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Founder
        fields = '__all__'

class StartupDetailSerializer(serializers.ModelSerializer):
    founders = FounderSerializer(many=True, read_only=True)

    class Meta:
        model = StartupDetail
        fields = '__all__'

class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = '__all__'
