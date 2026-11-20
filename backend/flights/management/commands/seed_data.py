from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import uuid

from accounts.models import User
from flights.models import Flight
from bookings.models import Booking, Passenger

class Command(BaseCommand):
    help = 'Seeds database with realistic sample users, flights, and bookings for AirBooking.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting AirBooking database seeding...'))

        # 1. Create Admin Account
        admin_user, created = User.objects.get_or_create(
            email='admin@airbooking.com',
            defaults={
                'full_name': 'Chief Administrator',
                'phone_number': '+1 (555) 019-2834',
                'status': 'APPROVED',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created Admin: admin@airbooking.com / admin123'))
        else:
            self.stdout.write('Admin account already exists.')

        # 2. Create Approved Customer
        approved_user, created = User.objects.get_or_create(
            email='alex.miller@example.com',
            defaults={
                'full_name': 'Alex Miller',
                'phone_number': '+1 (555) 321-4567',
                'status': 'APPROVED',
                'approved_at': timezone.now(),
            }
        )
        if created:
            approved_user.set_password('user123')
            approved_user.save()
            self.stdout.write(self.style.SUCCESS('Created Approved User: alex.miller@example.com / user123'))

        # 3. Create Pending Customer
        pending_user, created = User.objects.get_or_create(
            email='sarah.smith@example.com',
            defaults={
                'full_name': 'Sarah Smith',
                'phone_number': '+1 (555) 789-0123',
                'status': 'PENDING',
            }
        )
        if created:
            pending_user.set_password('user123')
            pending_user.save()
            self.stdout.write(self.style.SUCCESS('Created Pending User: sarah.smith@example.com / user123'))

        # 4. Create Flight Data
        now = timezone.now()
        flights_data = [
            {
                'flight_number': 'BA-117',
                'airline_name': 'British Airways',
                'airline_code': 'BA',
                'departure_airport': 'John F. Kennedy International Airport',
                'departure_code': 'JFK',
                'departure_city': 'New York',
                'arrival_airport': 'Heathrow Airport',
                'arrival_code': 'LHR',
                'arrival_city': 'London',
                'departure_time': now + timedelta(days=1, hours=4),
                'arrival_time': now + timedelta(days=1, hours=11),
                'ticket_price': Decimal('680.00'),
                'total_seats': 240,
                'available_seats': 185,
                'flight_status': 'ON_TIME',
                'aircraft_type': 'Boeing 777-300ER',
                'terminal': 'T7',
                'gate': 'Gate 14'
            },
            {
                'flight_number': 'EK-202',
                'airline_name': 'Emirates',
                'airline_code': 'EK',
                'departure_airport': 'Dubai International Airport',
                'departure_code': 'DXB',
                'departure_city': 'Dubai',
                'arrival_airport': 'Singapore Changi Airport',
                'arrival_code': 'SIN',
                'arrival_city': 'Singapore',
                'departure_time': now + timedelta(days=1, hours=8),
                'arrival_time': now + timedelta(days=1, hours=15, minutes=30),
                'ticket_price': Decimal('740.00'),
                'total_seats': 350,
                'available_seats': 142,
                'flight_status': 'ON_TIME',
                'aircraft_type': 'Airbus A380-800',
                'terminal': 'T3',
                'gate': 'Gate B22'
            },
            {
                'flight_number': 'AI-102',
                'airline_name': 'Air India',
                'airline_code': 'AI',
                'departure_airport': 'Indira Gandhi International Airport',
                'departure_code': 'DEL',
                'departure_city': 'New Delhi',
                'arrival_airport': 'Chhatrapati Shivaji Maharaj International',
                'arrival_code': 'BOM',
                'arrival_city': 'Mumbai',
                'departure_time': now + timedelta(hours=6),
                'arrival_time': now + timedelta(hours=8, minutes=15),
                'ticket_price': Decimal('115.00'),
                'total_seats': 180,
                'available_seats': 45,
                'flight_status': 'ON_TIME',
                'aircraft_type': 'Airbus A321neo',
                'terminal': 'T3',
                'gate': 'Gate 41'
            },
            {
                'flight_number': 'DL-452',
                'airline_name': 'Delta Air Lines',
                'airline_code': 'DL',
                'departure_airport': 'John F. Kennedy International Airport',
                'departure_code': 'JFK',
                'departure_city': 'New York',
                'arrival_airport': 'Heathrow Airport',
                'arrival_code': 'LHR',
                'arrival_city': 'London',
                'departure_time': now + timedelta(days=2, hours=2),
                'arrival_time': now + timedelta(days=2, hours=9),
                'ticket_price': Decimal('620.00'),
                'total_seats': 220,
                'available_seats': 80,
                'flight_status': 'DELAYED',
                'delay_reason': 'Late inbound aircraft arrival from Atlanta (ATL)',
                'aircraft_type': 'Boeing 767-400ER',
                'terminal': 'T4',
                'gate': 'Gate B28'
            },
            {
                'flight_number': 'UA-882',
                'airline_name': 'United Airlines',
                'airline_code': 'UA',
                'departure_airport': 'San Francisco International Airport',
                'departure_code': 'SFO',
                'departure_city': 'San Francisco',
                'arrival_airport': 'Tokyo Haneda Airport',
                'arrival_code': 'HND',
                'arrival_city': 'Tokyo',
                'departure_time': now + timedelta(days=3, hours=5),
                'arrival_time': now + timedelta(days=3, hours=16),
                'ticket_price': Decimal('895.00'),
                'total_seats': 275,
                'available_seats': 190,
                'flight_status': 'ON_TIME',
                'aircraft_type': 'Boeing 787-9 Dreamliner',
                'terminal': 'Intl G',
                'gate': 'Gate G94'
            },
            {
                'flight_number': 'AF-065',
                'airline_name': 'Air France',
                'airline_code': 'AF',
                'departure_airport': 'Los Angeles International Airport',
                'departure_code': 'LAX',
                'departure_city': 'Los Angeles',
                'arrival_airport': 'Charles de Gaulle Airport',
                'arrival_code': 'CDG',
                'arrival_city': 'Paris',
                'departure_time': now + timedelta(days=2, hours=10),
                'arrival_time': now + timedelta(days=2, hours=21),
                'ticket_price': Decimal('780.00'),
                'total_seats': 290,
                'available_seats': 115,
                'flight_status': 'ON_TIME',
                'aircraft_type': 'Boeing 777-200ER',
                'terminal': 'Tom Bradley',
                'gate': 'Gate 132'
            },
            {
                'flight_number': 'LH-400',
                'airline_name': 'Lufthansa',
                'airline_code': 'LH',
                'departure_airport': 'Frankfurt Airport',
                'departure_code': 'FRA',
                'departure_city': 'Frankfurt',
                'arrival_airport': 'John F. Kennedy International Airport',
                'arrival_code': 'JFK',
                'arrival_city': 'New York',
                'departure_time': now + timedelta(days=4, hours=3),
                'arrival_time': now + timedelta(days=4, hours=11, minutes=30),
                'ticket_price': Decimal('710.00'),
                'total_seats': 310,
                'available_seats': 210,
                'flight_status': 'CANCELLED',
                'delay_reason': 'Extreme crosswinds across North Atlantic corridor',
                'aircraft_type': 'Airbus A350-900',
                'terminal': 'T1',
                'gate': 'Gate Z15'
            },
            {
                'flight_number': 'SQ-322',
                'airline_name': 'Singapore Airlines',
                'airline_code': 'SQ',
                'departure_airport': 'Singapore Changi Airport',
                'departure_code': 'SIN',
                'departure_city': 'Singapore',
                'arrival_airport': 'Heathrow Airport',
                'arrival_code': 'LHR',
                'arrival_city': 'London',
                'departure_time': now + timedelta(days=3, hours=12),
                'arrival_time': now + timedelta(days=3, hours=25),
                'ticket_price': Decimal('850.00'),
                'total_seats': 264,
                'available_seats': 72,
                'flight_status': 'ON_TIME',
                'aircraft_type': 'Airbus A350-900',
                'terminal': 'T3',
                'gate': 'Gate A12'
            }
        ]

        seeded_flights = []
        for f_data in flights_data:
            flight, _ = Flight.objects.update_or_create(
                flight_number=f_data['flight_number'],
                defaults=f_data
            )
            seeded_flights.append(flight)
        self.stdout.write(self.style.SUCCESS(f'Seeded {len(seeded_flights)} realistic flights.'))

        # 5. Create Sample Booking for Alex Miller
        if seeded_flights and approved_user:
            sample_flight = seeded_flights[0] # BA-117
            booking_ref = "AB-789234"
            booking, created = Booking.objects.get_or_create(
                booking_reference=booking_ref,
                defaults={
                    'user': approved_user,
                    'flight': sample_flight,
                    'number_of_passengers': 2,
                    'total_price': sample_flight.ticket_price * 2,
                    'payment_status': 'PAID',
                    'payment_method': 'Credit Card (Visa •••• 4242)',
                    'transaction_id': 'PAY-7A8B9C0D1E',
                    'booking_status': 'CONFIRMED',
                    'seat_class': 'ECONOMY',
                }
            )
            if created:
                Passenger.objects.create(
                    booking=booking,
                    full_name='Alex Miller',
                    age=32,
                    gender='MALE',
                    seat_number='18A',
                    passport_or_id='P8472910'
                )
                Passenger.objects.create(
                    booking=booking,
                    full_name='Emma Miller',
                    age=29,
                    gender='FEMALE',
                    seat_number='18B',
                    passport_or_id='P8472911'
                )
                self.stdout.write(self.style.SUCCESS(f'Created sample booking {booking_ref} for {approved_user.email}'))

        self.stdout.write(self.style.SUCCESS('AirBooking database seed completed successfully!'))
