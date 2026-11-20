from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/flights/', include('flights.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/admin/', include('accounts.admin_urls')),
]
