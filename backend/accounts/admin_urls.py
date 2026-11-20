from django.urls import path
from accounts.views import (
    AdminPendingUsersView,
    AdminAllUsersView,
    AdminApproveUserView,
    AdminRejectUserView,
)
from flights.views import (
    AdminFlightListCreateView,
    AdminFlightDetailView,
    AdminFlightStatusUpdateView,
)
from bookings.views import (
    AdminBookingListView,
    AdminStatsView,
)

urlpatterns = [
    # User Management Endpoints
    path('users/pending/', AdminPendingUsersView.as_view(), name='admin-users-pending'),
    path('users/', AdminAllUsersView.as_view(), name='admin-users-all'),
    path('users/<int:pk>/approve/', AdminApproveUserView.as_view(), name='admin-user-approve'),
    path('users/<int:pk>/reject/', AdminRejectUserView.as_view(), name='admin-user-reject'),

    # Flight Management Endpoints
    path('flights/', AdminFlightListCreateView.as_view(), name='admin-flight-list-create'),
    path('flights/<int:pk>/', AdminFlightDetailView.as_view(), name='admin-flight-detail'),
    path('flights/<int:pk>/status/', AdminFlightStatusUpdateView.as_view(), name='admin-flight-status-update'),

    # Booking & Dashboard Endpoints
    path('bookings/', AdminBookingListView.as_view(), name='admin-bookings-list'),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
]
