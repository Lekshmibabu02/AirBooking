from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from accounts.models import User
from flights.models import Flight
from bookings.models import Booking

class BookingAndDashboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='dash_admin@airbooking.com',
            password='AdminPassword123',
            full_name='Admin Dashboard'
        )
        self.user1 = User.objects.create_user(
            email='passenger1@example.com',
            password='UserPass123',
            full_name='Passenger One',
            status='APPROVED'
        )
        self.user2 = User.objects.create_user(
            email='passenger2@example.com',
            password='UserPass123',
            full_name='Passenger Two',
            status='APPROVED'
        )
        self.now = timezone.now()
        self.flight = Flight.objects.create(
            flight_number='BK-550',
            airline_name='Aero Express',
            departure_airport='DEL Airport',
            departure_code='DEL',
            arrival_airport='BOM Airport',
            arrival_code='BOM',
            departure_time=self.now + timedelta(days=5),
            arrival_time=self.now + timedelta(days=5, hours=2),
            ticket_price=Decimal('100.00'),
            total_seats=5,
            available_seats=5,
            flight_status='ON_TIME'
        )

    def test_09_10_11_booking_workflow_seats_and_payment(self):
        """9, 10, 11: Flight booking, seat decrement, price calculation, payment simulation."""
        self.client.force_authenticate(user=self.user1)
        url = reverse('booking-list-create')
        payload = {
            'flight_id': self.flight.id,
            'number_of_passengers': 2,
            'seat_class': 'ECONOMY',
            'payment_method': 'Credit Card',
            'passengers': [
                {'full_name': 'Passenger One', 'age': 30, 'gender': 'MALE'},
                {'full_name': 'Passenger Child', 'age': 8, 'gender': 'FEMALE'}
            ]
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        
        booking_data = response.data['booking']
        self.assertTrue(booking_data['booking_reference'].startswith('AB-'))
        self.assertEqual(float(booking_data['total_price']), 200.00)
        self.assertEqual(booking_data['payment_status'], 'PAID')
        self.assertTrue(booking_data['transaction_id'].startswith('PAY-'))

        # Check seats decremented in database
        self.flight.refresh_from_db()
        self.assertEqual(self.flight.available_seats, 3)

    def test_overbooking_prevention(self):
        """Prevent reserving more seats than available."""
        self.client.force_authenticate(user=self.user1)
        url = reverse('booking-list-create')
        payload = {
            'flight_id': self.flight.id,
            'number_of_passengers': 6, # Flight only has 5
            'seat_class': 'ECONOMY'
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_12_my_trips_and_15_unauthorized_restriction(self):
        """12 & 15. User views only their bookings; unauthorized access is denied."""
        # Create booking for user1
        booking1 = Booking.objects.create(
            user=self.user1,
            flight=self.flight,
            number_of_passengers=1,
            total_price=Decimal('100.00'),
            payment_status='PAID'
        )
        
        # User 1 views My Trips
        self.client.force_authenticate(user=self.user1)
        url = reverse('booking-list-create')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking_refs = [b['booking_reference'] for b in response.data]
        self.assertIn(booking1.booking_reference, booking_refs)

        # User 2 attempts to view User 1's booking by ID
        self.client.force_authenticate(user=self.user2)
        detail_url = reverse('booking-detail', kwargs={'pk': booking1.id})
        detail_res = self.client.get(detail_url)
        self.assertEqual(detail_res.status_code, status.HTTP_403_FORBIDDEN)

    def test_booking_cancellation_and_seat_restoration(self):
        """Cancellation marks booking cancelled and restores seats to flight."""
        self.flight.available_seats = 3
        self.flight.save()
        booking = Booking.objects.create(
            user=self.user1,
            flight=self.flight,
            number_of_passengers=2,
            total_price=Decimal('200.00'),
            payment_status='PAID',
            booking_status='CONFIRMED'
        )
        self.client.force_authenticate(user=self.user1)
        cancel_url = reverse('booking-cancel', kwargs={'pk': booking.id})
        response = self.client.post(cancel_url, {'reason': 'Change of travel plans'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        booking.refresh_from_db()
        self.assertEqual(booking.booking_status, 'CANCELLED')
        self.assertEqual(booking.payment_status, 'REFUNDED')

        self.flight.refresh_from_db()
        self.assertEqual(self.flight.available_seats, 5)

    def test_13_admin_dashboard_stats(self):
        """13. Admin can retrieve aggregated dashboard statistics."""
        self.client.force_authenticate(user=self.admin)
        url = reverse('admin-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('users', response.data)
        self.assertIn('flights', response.data)
        self.assertIn('bookings', response.data)
        self.assertIn('revenue', response.data)
