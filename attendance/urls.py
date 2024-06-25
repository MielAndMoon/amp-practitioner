from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('practitioners/', views.get_practitioners, name='practitioners'),
    path('students/', views.getStudents, name='students'),
    path(
        'attendance/complete/',
        views.is_attendance_complete,
        name='is_attendance_complete',
    ),
    path(
        'attendance/only_set_entry_time/',
        views.is_only_set_entry_time,
        name='is_only_set_entry_time',
    ),
    path(
        'attendance/create/',
        views.create_attendance,
        name='create_attendance',
    ),
    path(
        'attendance/set_exit_time/',
        views.set_exit_time,
        name='set_exit_time',
    ),
]
