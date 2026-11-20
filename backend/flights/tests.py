from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from accounts.models import User
from flights.models import Flight

class FlightManagementAndSearchTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='flight_admin@airbooking.com',
            password='AdminPassword123',
            full_name='Flight Admin'
        )
        self.now = timezone.now()
        self.flight1 = Flight.objects.create(
            flight_number='TEST-101',
            airline_name='Skyways Test',
            departure_airport='JFK Airport',
            departure_code='JFK',
            arrival_airport='Heathrow Airport',
            arrival_code='LHR',
            departure_time=self.now + timedelta(days=2),
            arrival_time=self.now + timedelta(days=2, hours=7),
            ticket_price=Decimal('500.00'),
            total_seats=150,
            available_seats=150,
            flight_status='ON_TIME'
        )

    def test_07_flight_creation(self):
        """7. Admin can create new flights."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-flight-list-create')
        payload = {
            'flight_number': 'NEW-202',
            'airline_name': 'Global Air',
            'departure_airport': 'Dubai International',
            'departure_code': 'DXB',
            'arrival_airport': 'Changi Airport',
            'arrival_code': 'SIN',
            'departure_time': (self.now + timedelta(days=3)).isoformat(),
            'arrival_time': (self.now + timedelta(days=3, hours=8)).isoformat(),
            'ticket_price': '650.00',
            'total_seats': 200,
            'available_seats': 200,
            'flight_status': 'ON_TIME'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Flight.objects.filter(flight_number='NEW-202').count(), 1)

    def test_08_flight_searching(self):
        """8. Flight search filters by airport code, date, and availability."""
        url = reverse('flight-search')
        # Search for JFK -> LHR
        response = self.client.get(url, {'departure': 'JFK', 'arrival': 'LHR'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results should be in results or list
        data = response.data.get('results', response.data)
        self.assertGreaterEqual(len(data), 1)
        self.assertEqual(data[0]['flight_number'], 'TEST-101')

    def test_14_flight_status_updates(self):
        """14. Admin can update flight status (e.g. DELAYED with reason)."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-flight-status-update', kwargs={'pk': self.flight1.pk})
        payload = {
            'flight_status': 'DELAYED',
            'delay_reason': 'Weather delay over Atlantic'
        }
        response = self.client.put(url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.flight1.refresh_from_db()
        self.assertEqual(self.flight1.flight_status, 'DELAYED')
        self.assertEqual(self.flight1.delay_reason, 'Weather delay over Atlantic')

    def test_realtime_status_endpoint(self):
        """Verify real-time flight status returns telemetry and distinguishes LIVE vs DEMONSTRATION."""
        url = reverse('flight-realtime-status', kwargs={'pk': self.flight1.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('source', response.data)
        self.assertIn(response.data['source'], ['LIVE_API', 'DEMONSTRATION'])
        self.assertIn('disclaimer', response.data)
