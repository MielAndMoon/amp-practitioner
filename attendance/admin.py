from django.contrib import admin
from django.http import HttpRequest
from typing import Any
from django.contrib.auth.models import User
from attendance.models import (
    Attendance,
    Career,
    Practitioner,
    Student,
    StudyCenter,
)


class AttendanceAdminArea(admin.AdminSite):
    site_header = "Administrador"
    site_title = "Administrador de asistencia"
    index_title = "Administrador de asistencia"
    login_template = "admin/login.html"


attendance_admin = AttendanceAdminArea(name="asistencia")


class MyUserAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_view_permission(self, request: HttpRequest, obj: Any | None = ...):
        return False

    exclude = [
        "password",
        "is_staff",
        "is_active",
    ]


# Register your models here.
class PractitionerInlineFormset(admin.StackedInline):
    model = Practitioner
    verbose_name = "Datos de practica"


class StudentAdmin(admin.ModelAdmin):
    inlines = [PractitionerInlineFormset]
    list_display = ["dni", "first_name",
                    "last_name", "phone", "birthdate", "sex"]
    list_filter = ("sex",)
    search_fields = ["dni", "first_name", "last_name"]
    list_display_links = ("dni",)


class CareerAdmin(admin.ModelAdmin):
    list_display = ["name", "study_center"]
    list_filter = ("study_center",)
    list_display_links = ("name",)


class PractitionerAdmin(admin.ModelAdmin):
    def has_change_permission(self, request: HttpRequest, obj: Any | None = ...) -> bool:
        return False

    def has_delete_permission(self, request: HttpRequest, obj: Any | None = ...) -> bool:
        return False

    def has_add_permission(self, request: HttpRequest):
        return False


class AttendanceAdmin(admin.ModelAdmin):
    list_display = ["practitioner", "log_date", "entry_time", "exit_time"]

    def has_change_permission(self, request: HttpRequest, obj: Any | None = ...) -> bool:
        return False

    def has_delete_permission(self, request: HttpRequest, obj: Any | None = ...) -> bool:
        return False

    def has_add_permission(self, request: HttpRequest):
        return False


attendance_admin.register(User, MyUserAdmin)
attendance_admin.register(Practitioner, PractitionerAdmin)
attendance_admin.register(Student, StudentAdmin)
attendance_admin.register(StudyCenter)
attendance_admin.register(Career, CareerAdmin)
attendance_admin.register(Attendance, AttendanceAdmin)
