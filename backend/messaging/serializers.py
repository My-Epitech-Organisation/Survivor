from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Message, ReadReceipt, Thread, TypingIndicator

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name"]


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "thread", "sender", "body", "created_at"]
        read_only_fields = ["thread", "sender"]


class ThreadCreateSerializer(serializers.Serializer):
    participants = serializers.ListField(child=serializers.IntegerField(), min_length=1)
    message = serializers.CharField(required=True)

    def validate_participants(self, value):
        user_ids = set(value)
        users = User.objects.filter(id__in=user_ids)

        if users.count() != len(user_ids):
            raise serializers.ValidationError("One or more participants do not exist.")

        request_user = self.context["request"].user
        if request_user.id not in user_ids:
            user_ids.add(request_user.id)

        return list(user_ids)


class ReadReceiptSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ReadReceipt
        fields = ["id", "user", "last_read_message", "read_at"]
        read_only_fields = ["user", "read_at"]


class TypingIndicatorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TypingIndicator
        fields = ["id", "user", "is_typing", "started_at"]
        read_only_fields = ["user", "started_at"]


class ThreadSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = ["id", "participants", "created_at", "last_message_at", "last_message", "unread_count"]

    def get_last_message(self, thread):
        last_message = thread.messages.order_by("-created_at").first()
        return MessageSerializer(last_message).data if last_message else None

    def get_unread_count(self, thread):
        user = self.context["request"].user

        read_receipt = ReadReceipt.objects.filter(thread=thread, user=user).first()

        if not read_receipt or not read_receipt.last_read_message:
            return thread.messages.exclude(sender=user).count()

        return (
            thread.messages.filter(created_at__gt=read_receipt.last_read_message.created_at)
            .exclude(sender=user)
            .count()
        )


class ThreadDetailSerializer(ThreadSerializer):
    messages = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = ["id", "participants", "created_at", "last_message_at", "messages", "unread_count"]

    def get_messages(self, thread):
        messages = thread.messages.order_by("-created_at")
        return MessageSerializer(messages, many=True).data
