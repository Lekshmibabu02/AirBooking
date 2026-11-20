from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Sum, Count
from django.utils import timezone

from accounts.models import User
from flights.models import Flight
from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingDetailSerializer
)

class BookingListCreateView(APIView):
    """
    List user's trips or create a new flight booking.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(user=request.user).order_by('-booking_date')
        
        # Optional filter by status (UPCOMING, COMPLETED, CANCELLED)
        status_param = request.query_params.get('status')
        if status_param:
            if status_param.upper() == 'CANCELLED':
                bookings = bookings.filter(booking_status='CANCELLED')
            elif status_param.upper() == 'CONFIRMED':
                bookings = bookings.filter(booking_status='CONFIRMED')

        serializer = BookingDetailSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            booking = serializer.save()
            return Response({
                "success": True,
                "message": "Flight booked successfully! Payment simulated and confirmed.",
                "booking": BookingDetailSerializer(booking).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BookingDetailView(APIView):
    """
    Retrieve single booking by ID or reference code.
    Ensures users can only access their own bookings.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        # Support lookup by integer ID or booking reference string
        if str(pk).isdigit():
            booking = get_object_or_404(Booking, pk=pk)
        else:
            booking = get_object_or_404(Booking, booking_reference=pk)

        # Security check: User must own the booking or be staff
        if booking.user != request.user and not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to view this booking."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = BookingDetailSerializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)

class BookingCancelView(APIView):
    """
    Cancel an existing booking and restore flight seats atomically.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk)

        if booking.user != request.user and not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to cancel this booking."},
                status=status.HTTP_403_FORBIDDEN
            )

        if booking.booking_status == 'CANCELLED':
            return Response(
                {"message": "This booking is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = request.data.get('reason', 'Customer requested cancellation')

        # Atomic transaction to restore flight available seats
        with transaction.atomic():
            flight = Flight.objects.select_for_update().get(id=booking.flight.id)
            flight.available_seats = min(flight.total_seats, flight.available_seats + booking.number_of_passengers)
            flight.save(update_fields=['available_seats'])

            booking.booking_status = 'CANCELLED'
            booking.payment_status = 'REFUNDED'
            booking.cancellation_date = timezone.now()
            booking.cancellation_reason = reason
            booking.save()

        return Response({
            "success": True,
            "message": "Booking has been successfully cancelled and payment marked as Refunded.",
            "booking": BookingDetailSerializer(booking).data
        }, status=status.HTTP_200_OK)

# --- Admin Dashboard & Statistics Endpoints ---

class AdminBookingListView(generics.ListAPIView):
    """Admin view to inspect all bookings across the platform."""
    queryset = Booking.objects.all().order_by('-booking_date')
    serializer_class = BookingDetailSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminStatsView(APIView):
    """
    Comprehensive dashboard statistics for Admin:
    - User stats: Total, Pending, Approved
    - Flight stats: Total, On-time, Delayed, Cancelled
    - Booking stats: Total, Confirmed, Cancelled
    - Financial stats: Total Revenue generated
    - Recent bookings
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        pending_users = User.objects.filter(status='PENDING').count()
        approved_users = User.objects.filter(status='APPROVED').count()
        rejected_users = User.objects.filter(status='REJECTED').count()

        total_flights = Flight.objects.count()
        ontime_flights = Flight.objects.filter(flight_status='ON_TIME').count()
        delayed_flights = Flight.objects.filter(flight_status='DELAYED').count()
        cancelled_flights = Flight.objects.filter(flight_status='CANCELLED').count()

        total_bookings = Booking.objects.count()
        confirmed_bookings = Booking.objects.filter(booking_status='CONFIRMED').count()
        cancelled_bookings = Booking.objects.filter(booking_status='CANCELLED').count()

        revenue_agg = Booking.objects.filter(
            booking_status='CONFIRMED',
            payment_status='PAID'
        ).aggregate(total=Sum('total_price'))
        total_revenue = float(revenue_agg['total'] or 0.0)

        # Recent 5 bookings
        recent_bookings = Booking.objects.select_related('user', 'flight').order_by('-booking_date')[:5]
        recent_data = BookingDetailSerializer(recent_bookings, many=True).data

        return Response({
            "users": {
                "total": total_users,
                "pending": pending_users,
                "approved": approved_users,
                "rejected": rejected_users,
            },
            "flights": {
                "total": total_flights,
                "on_time": ontime_flights,
                "delayed": delayed_flights,
                "cancelled": cancelled_flights,
            },
            "bookings": {
                "total": total_bookings,
                "confirmed": confirmed_bookings,
                "cancelled": cancelled_bookings,
            },
            "revenue": {
                "total": total_revenue,
                "currency": "USD"
            },
            "recent_bookings": recent_data
        }, status=status.HTTP_200_OK)
