from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User profile details."""
    class Meta:
        model = User
        fields = (
            'id', 'email', 'full_name', 'phone_number',
            'status', 'is_staff', 'is_superuser', 'date_joined', 'approved_at'
        )
        read_only_fields = ('id', 'status', 'is_staff', 'is_superuser', 'date_joined', 'approved_at')

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration with pending status."""
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'phone_number', 'password', 'confirm_password', 'status')
        read_only_fields = ('id', 'status')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        user = User.objects.create(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            phone_number=validated_data.get('phone_number', ''),
            status='PENDING'
        )
        user.set_password(password)
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT Token serializer enforcing the requirement:
    Only approved users (or admin/staff) can log in.
    """
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError("Email and password are both required.")

        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("This user account has been deactivated.")

        # Enforcement of Admin Approval workflow
        if not user.is_staff and not user.is_superuser:
            if user.status == 'PENDING':
                raise serializers.ValidationError(
                    "Your account registration is currently pending admin approval. "
                    "You will be notified via email once approved."
                )
            elif user.status == 'REJECTED':
                raise serializers.ValidationError(
                    "Your account registration was rejected by the administration. "
                    "Please contact support for further assistance."
                )

        data = super().validate(attrs)
        data['user'] = UserSerializer(user).data
        return data

class UserStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['APPROVED', 'REJECTED'])
    reason = serializers.CharField(required=False, allow_blank=True, default='')
