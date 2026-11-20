from django.contrib import admin
from .models import Booking, Passenger

class PassengerInline(admin.TabularInline):
    model = Passenger
    extra = 0

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'booking_reference', 'user', 'flight',
        'number_of_passengers', 'total_price',
        'payment_status', 'booking_status', 'booking_date'
    )
    list_filter = ('booking_status', 'payment_status', 'seat_class')
    search_fields = ('booking_reference', 'user__email', 'flight__flight_number')
    inlines = [PassengerInline]

@admin.register(Passenger)
class PassengerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'booking', 'age', 'gender', 'seat_number')
    search_fields = ('full_name', 'booking__booking_reference')
