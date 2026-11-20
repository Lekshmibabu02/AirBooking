import uuid
from decimal import Decimal
from rest_framework import serializers
from django.db import transaction
from django.utils import timezone

from flights.models import Flight
from flights.serializers import FlightSerializer
from accounts.serializers import UserSerializer
from .models import Booking, Passenger

class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = ('id', 'full_name', 'age', 'gender', 'seat_number', 'passport_or_id')

class BookingCreateSerializer(serializers.Serializer):
    flight_id = serializers.IntegerField()
    number_of_passengers = serializers.IntegerField(min_value=1, max_value=9)
    seat_class = serializers.ChoiceField(
        choices=Booking.SEAT_CLASS_CHOICES,
        default='ECONOMY'
    )
    payment_method = serializers.CharField(default='Credit Card')
    passengers = PassengerSerializer(many=True, required=False)

    def validate(self, attrs):
        flight_id = attrs.get('flight_id')
        num_passengers = attrs.get('number_of_passengers')
        passengers_data = attrs.get('passengers', [])

        try:
            flight = Flight.objects.get(id=flight_id)
        except Flight.DoesNotExist:
            raise serializers.ValidationError({"flight_id": "Selected flight does not exist."})

        if flight.flight_status == 'CANCELLED':
            raise serializers.ValidationError({"flight_id": "This flight has been cancelled and cannot be booked."})

        if flight.departure_time <= timezone.now():
            raise serializers.ValidationError({"flight_id": "Cannot book a flight that has already departed."})

        if flight.available_seats < num_passengers:
            raise serializers.ValidationError({
                "number_of_passengers": f"Only {flight.available_seats} seats remaining on this flight."
            })

        attrs['flight'] = flight
        return attrs

    def create(self, validated_data):
        flight = validated_data['flight']
        num_passengers = validated_data['number_of_passengers']
        seat_class = validated_data.get('seat_class', 'ECONOMY')
        payment_method = validated_data.get('payment_method', 'Credit Card')
        passengers_data = validated_data.get('passengers', [])
        user = self.context['request'].user

        # Price calculation with optional class multiplier
        base_price = flight.ticket_price
        multiplier = Decimal('1.0')
        if seat_class == 'PREMIUM_ECONOMY':
            multiplier = Decimal('1.3')
        elif seat_class == 'BUSINESS':
            multiplier = Decimal('2.0')
        elif seat_class == 'FIRST':
            multiplier = Decimal('3.2')

        unit_price = base_price * multiplier
        total_price = unit_price * Decimal(num_passengers)

        # Atomic transaction with row locking to prevent overbooking & race conditions
        with transaction.atomic():
            locked_flight = Flight.objects.select_for_update().get(id=flight.id)
            if locked_flight.available_seats < num_passengers:
                raise serializers.ValidationError("Seats were just reserved by another customer. Please try again.")

            # Decrement seats
            locked_flight.available_seats -= num_passengers
            locked_flight.save(update_fields=['available_seats'])

            # Payment simulation
            txn_id = f"PAY-{uuid.uuid4().hex[:10].upper()}"

            # Create booking
            booking = Booking.objects.create(
                user=user,
                flight=locked_flight,
                number_of_passengers=num_passengers,
                total_price=round(total_price, 2),
                payment_status='PAID',
                payment_method=payment_method,
                transaction_id=txn_id,
                booking_status='CONFIRMED',
                seat_class=seat_class
            )

            # Assign passenger records
            if passengers_data:
                for idx, p_data in enumerate(passengers_data):
                    seat_assigned = p_data.get('seat_number') or f"{12 + idx}{chr(65 + (idx % 6))}"
                    Passenger.objects.create(
                        booking=booking,
                        full_name=p_data['full_name'],
                        age=p_data['age'],
                        gender=p_data.get('gender', 'MALE'),
                        seat_number=seat_assigned,
                        passport_or_id=p_data.get('passport_or_id', '')
                    )
            else:
                # Default passenger if none provided in payload
                Passenger.objects.create(
                    booking=booking,
                    full_name=user.full_name or "Primary Passenger",
                    age=30,
                    gender='MALE',
                    seat_number="14A"
                )

        return booking

class BookingDetailSerializer(serializers.ModelSerializer):
    flight = FlightSerializer(read_only=True)
    passengers = PassengerSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = (
            'id',
            'booking_reference',
            'user',
            'flight',
            'number_of_passengers',
            'total_price',
            'payment_status',
            'payment_method',
            'transaction_id',
            'booking_status',
            'seat_class',
            'booking_date',
            'cancellation_date',
            'cancellation_reason',
            'passengers',
        )
