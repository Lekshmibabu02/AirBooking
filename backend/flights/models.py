from django.db import models
from django.utils import timezone

class Flight(models.Model):
    STATUS_CHOICES = (
        ('ON_TIME', 'On-time'),
        ('DELAYED', 'Delayed'),
        ('CANCELLED', 'Cancelled'),
    )

    flight_number = models.CharField(max_length=20, unique=True, db_index=True)
    airline_name = models.CharField(max_length=100)
    airline_code = models.CharField(max_length=10, blank=True, default='')

    departure_airport = models.CharField(max_length=150)
    departure_code = models.CharField(max_length=10, db_index=True)
    departure_city = models.CharField(max_length=100, blank=True, default='')

    arrival_airport = models.CharField(max_length=150)
    arrival_code = models.CharField(max_length=10, db_index=True)
    arrival_city = models.CharField(max_length=100, blank=True, default='')

    departure_time = models.DateTimeField(db_index=True)
    arrival_time = models.DateTimeField()

    ticket_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_seats = models.PositiveIntegerField(default=180)
    available_seats = models.PositiveIntegerField(default=180)

    flight_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ON_TIME',
        db_index=True
    )
    delay_reason = models.CharField(max_length=255, blank=True, default='')
    
    aircraft_type = models.CharField(max_length=50, blank=True, default='Boeing 737-800')
    terminal = models.CharField(max_length=10, blank=True, default='T1')
    gate = models.CharField(max_length=10, blank=True, default='G12')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['departure_time']
        indexes = [
            models.Index(fields=['departure_code', 'arrival_code', 'departure_time']),
        ]

    def __str__(self):
        return f"{self.flight_number} - {self.airline_name} ({self.departure_code} -> {self.arrival_code})"

    @property
    def duration_minutes(self):
        if self.arrival_time and self.departure_time:
            diff = self.arrival_time - self.departure_time
            return int(diff.total_seconds() // 60)
        return 0

    @property
    def duration_display(self):
        total_mins = self.duration_minutes
        hours = total_mins // 60
        mins = total_mins % 60
        return f"{hours}h {mins}m"
