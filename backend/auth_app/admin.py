from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.http import HttpResponse
import csv
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "first_name", "last_name", "phone", "is_staff")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("username",)
    fieldsets = BaseUserAdmin.fieldsets + (("Extra", {"fields": ("phone",)}),)
    add_fieldsets = BaseUserAdmin.add_fieldsets + (("Extra", {"fields": ("email", "phone")}),)
    actions = ["export_as_csv"]

    def export_as_csv(self, request, queryset):
        """
        Export selected users as a CSV file.
        """
        meta = self.model._meta
        field_names = ["id", "username", "email", "first_name", "last_name", "phone",
                       "is_staff", "is_superuser", "date_joined"]
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f"attachment; filename={meta.verbose_name_plural}.csv"
        writer = csv.writer(response)
        writer.writerow(field_names)
        for obj in queryset:
            writer.writerow([getattr(obj, field) for field in field_names])
        return response
    export_as_csv.short_description = "Export selected users as CSV"
