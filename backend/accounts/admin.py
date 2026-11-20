from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'phone_number', 'status', 'is_staff', 'date_joined', 'approved_at')
    list_filter = ('status', 'is_staff', 'is_superuser')
    search_fields = ('email', 'full_name', 'phone_number')
    ordering = ('-date_joined',)
    actions = ['approve_selected_users', 'reject_selected_users']

    @admin.action(description="Approve selected user accounts")
    def approve_selected_users(self, request, queryset):
        queryset.update(status='APPROVED')

    @admin.action(description="Reject selected user accounts")
    def reject_selected_users(self, request, queryset):
        queryset.update(status='REJECTED')
