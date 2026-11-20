from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from unittest.mock import patch

from .models import User

class AuthenticationAndApprovalTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email='admin_test@airbooking.com',
            password='Password@123',
            full_name='Test Admin'
        )

    def test_01_user_registration(self):
        """1. Users can register and initial status is PENDING."""
        url = reverse('auth-register')
        payload = {
            'full_name': 'John Doe',
            'email': 'john.doe@example.com',
            'phone_number': '+1234567890',
            'password': 'SecurePassword123',
            'confirm_password': 'SecurePassword123'
        }
        response = self.client.post(url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        
        user = User.objects.get(email='john.doe@example.com')
        self.assertEqual(user.status, 'PENDING')
        self.assertEqual(user.full_name, 'John Doe')

    def test_02_pending_account_login_restriction(self):
        """2. Pending user cannot log in."""
        user = User.objects.create_user(
            email='pending@example.com',
            password='TestPassword123',
            full_name='Pending User',
            status='PENDING'
        )
        url = reverse('auth-login')
        response = self.client.post(url, {
            'email': 'pending@example.com',
            'password': 'TestPassword123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("pending admin approval", str(response.data))

    @patch('accounts.views.send_approval_email_task.delay')
    def test_03_and_04_admin_approval_and_email_task(self, mock_celery_task):
        """3 & 4. Admin can approve user and Celery email notification is dispatched."""
        user = User.objects.create_user(
            email='to_approve@example.com',
            password='TestPassword123',
            full_name='To Approve User',
            status='PENDING'
        )
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-user-approve', kwargs={'pk': user.pk})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.status, 'APPROVED')
        mock_celery_task.assert_called_once_with(user.email, user.full_name)

    def test_05_and_06_approved_user_login_and_jwt(self):
        """5 & 6. Approved user can log in and receives valid JWT tokens."""
        user = User.objects.create_user(
            email='approved@example.com',
            password='TestPassword123',
            full_name='Approved User',
            status='APPROVED'
        )
        url = reverse('auth-login')
        response = self.client.post(url, {
            'email': 'approved@example.com',
            'password': 'TestPassword123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'approved@example.com')
