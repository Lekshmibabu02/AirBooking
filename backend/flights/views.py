from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from datetime import datetime

from .models import Flight
from .serializers import FlightSerializer, FlightStatusUpdateSerializer
from .services import FlightStatusService

class FlightListView(generics.ListAPIView):
    """
    Public flight search and listing with comprehensive filtering.
    Filters by departure/arrival code or name, travel date, seat availability, airline, price range, and sorting.
    """
    serializer_class = FlightSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Default: show upcoming or recent flights
        queryset = Flight.objects.all()

        params = self.request.query_params

        # Departure search
        departure = params.get('departure', '').strip()
        departure_code = params.get('departure_code', '').strip()
        if departure_code:
            queryset = queryset.filter(departure_code__iexact=departure_code)
        elif departure:
            queryset = queryset.filter(
                Q(departure_code__iexact=departure) |
                Q(departure_airport__icontains=departure) |
                Q(departure_city__icontains=departure)
            )

        # Arrival search
        arrival = params.get('arrival', '').strip()
        arrival_code = params.get('arrival_code', '').strip()
        if arrival_code:
            queryset = queryset.filter(arrival_code__iexact=arrival_code)
        elif arrival:
            queryset = queryset.filter(
                Q(arrival_code__iexact=arrival) |
                Q(arrival_airport__icontains=arrival) |
                Q(arrival_city__icontains=arrival)
            )

        # Travel date filter (YYYY-MM-DD)
        date_str = params.get('date', '').strip()
        if date_str:
            try:
                travel_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                queryset = queryset.filter(departure_time__date=travel_date)
            except ValueError:
                pass

        # Number of passengers / seat availability
        passengers = params.get('passengers')
        if passengers:
            try:
                pass_count = int(passengers)
                queryset = queryset.filter(available_seats__gte=pass_count)
            except ValueError:
                pass

        # Status filter
        flight_status = params.get('status')
        if flight_status:
            queryset = queryset.filter(flight_status=flight_status.upper())

        # Airline filter
        airline = params.get('airline')
        if airline:
            queryset = queryset.filter(airline_name__icontains=airline)

        # Price range
        min_price = params.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(ticket_price__gte=float(min_price))
            except ValueError:
                pass

        max_price = params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(ticket_price__lte=float(max_price))
            except ValueError:
                pass

        # Sorting
        sort_by = params.get('sort_by', 'departure_time')
        if sort_by in ['ticket_price', '-ticket_price', 'departure_time', '-departure_time', 'duration']:
            if sort_by == 'duration':
                # We order by departure_time by default
                queryset = queryset.order_by('departure_time')
            else:
                queryset = queryset.order_by(sort_by)
        else:
            queryset = queryset.order_by('departure_time')

        return queryset

class FlightSearchView(FlightListView):
    """Dedicated alias for search endpoint."""
    pass

class FlightDetailView(generics.RetrieveAPIView):
    """Get flight details by ID."""
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [permissions.AllowAny]

class FlightRealtimeStatusView(APIView):
    """
    Get live ADS-B status from OpenSky / AirLabs or marked demonstration telemetry.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        flight = get_object_or_404(Flight, pk=pk)
        telemetry = FlightStatusService.get_realtime_status(flight)
        return Response(telemetry, status=status.HTTP_200_OK)

# --- Admin Flight Management Endpoints ---

class AdminFlightListCreateView(generics.ListCreateAPIView):
    """Admin endpoint to view all flights or add new flight."""
    queryset = Flight.objects.all().order_by('-departure_time')
    serializer_class = FlightSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminFlightDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin endpoint to view, edit or delete a flight."""
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminFlightStatusUpdateView(APIView):
    """Admin endpoint to specifically update flight status."""
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, pk):
        flight = get_object_or_404(Flight, pk=pk)
        serializer = FlightStatusUpdateSerializer(flight, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "message": f"Flight {flight.flight_number} status updated to {flight.flight_status}.",
                "flight": FlightSerializer(flight).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
