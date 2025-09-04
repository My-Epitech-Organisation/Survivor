from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that adds user info to token response
    """

    def validate(self, attrs):
        data = super().validate(attrs)

        data["user"] = {
            "id": self.user.id,
            "email": self.user.email,
            "name": self.user.name,
            "role": self.user.role,
        }

        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("email", "name", "password", "password_confirm", "role")

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        user = User.objects.create_user(
            email=validated_data["email"],
            name=validated_data["name"],
            role=validated_data.get("role", "user"),
            password=validated_data["password"],
        )

        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile
    """

    class Meta:
        model = User
        fields = ("id", "email", "name", "role", "image", "founder_id", "investor_id")
        read_only_fields = ("id", "email")


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset request
    """

    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation
    """

    token = serializers.UUIDField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        from .models import PasswordResetToken
        try:
            token_obj = PasswordResetToken.objects.get(token=attrs["token"])
            if not token_obj.is_valid():
                raise serializers.ValidationError({"token": "Token is expired or has been used."})
            attrs["token_obj"] = token_obj
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({"token": "Invalid token."})

        return attrs

    def save(self):
        token_obj = self.validated_data["token_obj"]
        user = token_obj.user

        # Set new password
        user.set_password(self.validated_data["password"])
        user.save()

        # Mark token as used
        token_obj.is_used = True
        token_obj.save()

        return user
