from django.contrib import admin
from .models import Flight

@admin.register(Flight)
class FlightAdmin(admin.ModelAdmin):
    list_display = (
        'flight_number', 'airline_name', 'departure_code',
        'arrival_code', 'departure_time', 'arrival_time',
        'ticket_price', 'available_seats', 'flight_status'
    )
    list_filter = ('flight_status', 'airline_name', 'departure_code', 'arrival_code')
    search_fields = ('flight_number', 'airline_name', 'departure_airport', 'arrival_airport')
    ordering = ('departure_time',)
