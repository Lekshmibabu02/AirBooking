from rest_framework import serializers
from .models import Flight

class FlightSerializer(serializers.ModelSerializer):
    duration_display = serializers.CharField(read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)

    class Meta:
        model = Flight
        fields = (
            'id',
            'flight_number',
            'airline_name',
            'airline_code',
            'departure_airport',
            'departure_code',
            'departure_city',
            'arrival_airport',
            'arrival_code',
            'arrival_city',
            'departure_time',
            'arrival_time',
            'ticket_price',
            'total_seats',
            'available_seats',
            'flight_status',
            'delay_reason',
            'aircraft_type',
            'terminal',
            'gate',
            'duration_display',
            'duration_minutes',
            'created_at',
            'updated_at',
        )

    def validate(self, data):
        dep_time = data.get('departure_time', getattr(self.instance, 'departure_time', None))
        arr_time = data.get('arrival_time', getattr(self.instance, 'arrival_time', None))
        
        if dep_time and arr_time and arr_time <= dep_time:
            raise serializers.ValidationError({"arrival_time": "Arrival time must be strictly after departure time."})

        total = data.get('total_seats', getattr(self.instance, 'total_seats', 180))
        avail = data.get('available_seats', getattr(self.instance, 'available_seats', total))
        if avail > total:
            raise serializers.ValidationError({"available_seats": "Available seats cannot exceed total seats."})

        return data

class FlightStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flight
        fields = ('flight_status', 'delay_reason')
