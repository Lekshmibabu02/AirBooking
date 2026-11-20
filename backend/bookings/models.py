import uuid
from django.db import models
from django.conf import settings
from flights.models import Flight

def generate_booking_reference():
    """Generate a clean, professional booking reference like AB-8X4K2P."""
    code = uuid.uuid4().hex[:6].upper()
    return f"AB-{code}"

class Booking(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('PAID', 'Paid'),
        ('PENDING', 'Pending Payment'),
        ('REFUNDED', 'Refunded'),
        ('FAILED', 'Failed'),
    )

    BOOKING_STATUS_CHOICES = (
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    )

    SEAT_CLASS_CHOICES = (
        ('ECONOMY', 'Economy Class'),
        ('PREMIUM_ECONOMY', 'Premium Economy'),
        ('BUSINESS', 'Business Class'),
        ('FIRST', 'First Class'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    flight = models.ForeignKey(
        Flight,
        on_delete=models.PROTECT,
        related_name='bookings'
    )
    booking_reference = models.CharField(
        max_length=20,
        unique=True,
        default=generate_booking_reference,
        db_index=True
    )
    number_of_passengers = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='PAID'
    )
    payment_method = models.CharField(max_length=50, default='Credit Card')
    transaction_id = models.CharField(max_length=100, blank=True, default='')

    booking_status = models.CharField(
        max_length=20,
        choices=BOOKING_STATUS_CHOICES,
        default='CONFIRMED',
        db_index=True
    )
    seat_class = models.CharField(
        max_length=25,
        choices=SEAT_CLASS_CHOICES,
        default='ECONOMY'
    )
    booking_date = models.DateTimeField(auto_now_add=True)
    cancellation_date = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        ordering = ['-booking_date']

    def __str__(self):
        return f"Ref: {self.booking_reference} - {self.flight.flight_number} ({self.user.email})"

class Passenger(models.Model):
    GENDER_CHOICES = (
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    )

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='passengers'
    )
    full_name = models.CharField(max_length=150)
    age = models.PositiveIntegerField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='MALE')
    seat_number = models.CharField(max_length=10, blank=True, default='')
    passport_or_id = models.CharField(max_length=50, blank=True, default='')

    def __str__(self):
        return f"{self.full_name} ({self.seat_number}) on {self.booking.booking_reference}"
