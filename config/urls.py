from django.contrib import admin
from django.urls import path
from attendance.admin import attendance_admin
from django.conf.urls import handler404

handler404 = "attendance.views.custom_404"

urlpatterns = [
    path('admin/', attendance_admin.urls),
]
