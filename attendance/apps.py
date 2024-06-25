from django.apps import AppConfig


class AttendanceAdminConfig(AppConfig):
    default_site = 'attendance.admin.AttendanceAdminArea'


class AttendanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'attendance'
    verbose_name = 'Asistencia'
