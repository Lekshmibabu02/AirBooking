from django.urls import path
from .views import (
    FlightListView,
    FlightSearchView,
    FlightDetailView,
    FlightRealtimeStatusView
)

urlpatterns = [
    path('', FlightListView.as_view(), name='flight-list'),
    path('search/', FlightSearchView.as_view(), name='flight-search'),
    path('<int:pk>/', FlightDetailView.as_view(), name='flight-detail'),
    path('<int:pk>/realtime-status/', FlightRealtimeStatusView.as_view(), name='flight-realtime-status'),
]
