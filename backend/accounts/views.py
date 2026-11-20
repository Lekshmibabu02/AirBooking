from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import User
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    UserStatusUpdateSerializer
)
from .tasks import send_approval_email_task, send_rejection_email_task

class RegisterView(generics.CreateAPIView):
    """
    Public registration endpoint.
    Creates a user with PENDING status.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "success": True,
            "message": "Registration successful! Your account status is 'Pending'. An administrator will review your account shortly.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class CustomLoginView(TokenObtainPairView):
    """
    JWT Login view. Only approved users (or staff) can obtain tokens.
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update authenticated user profile.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class AdminPendingUsersView(generics.ListAPIView):
    """
    List all pending user registrations (Admin only).
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(status='PENDING').order_by('-date_joined')

class AdminAllUsersView(generics.ListAPIView):
    """
    List all registered users with optional status filtering (Admin only).
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(email__icontains=search) | queryset.filter(full_name__icontains=search)
        return queryset

class AdminApproveUserView(APIView):
    """
    Approve a pending user registration and trigger Celery email notification.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if user.status == 'APPROVED':
            return Response(
                {"message": f"User {user.email} is already approved."},
                status=status.HTTP_200_OK
            )

        user.status = 'APPROVED'
        user.approved_at = timezone.now()
        user.save()

        # Dispatch Celery background task for email notification
        try:
            send_approval_email_task.delay(user.email, user.full_name)
        except Exception as e:
            # Fallback to direct synchronous execution if worker error
            send_approval_email_task(user.email, user.full_name)

        return Response({
            "success": True,
            "message": f"User {user.email} has been approved successfully. Email notification queued.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class AdminRejectUserView(APIView):
    """
    Reject a user registration and trigger Celery rejection notification.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        reason = request.data.get('reason', 'Account registration criteria not met.')

        user.status = 'REJECTED'
        user.save()

        try:
            send_rejection_email_task.delay(user.email, user.full_name, reason)
        except Exception:
            send_rejection_email_task(user.email, user.full_name, reason)

        return Response({
            "success": True,
            "message": f"User {user.email} has been rejected.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)
