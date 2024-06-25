from django.contrib import admin
from django.urls import path
from attendance.admin import attendance_admin

urlpatterns = [
    path('admin/', attendance_admin.urls),
]
