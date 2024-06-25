import json
from django.http import JsonResponse
from django.shortcuts import render
from django.conf.urls import handler404
from django.conf import settings

from attendance.models import Attendance, Practitioner, Student


def index(request):
    return render(request, "attendance/index.html")


def get_practitioners(request):
    if request.headers.get("Authorization") == settings.API_KEY:
        data = list(Practitioner.objects.values())
        return JsonResponse({"data": data})
    else:
        return handler404(request, "404")


def getStudents(request):
    if request.headers.get("Authorization") == settings.API_KEY:
        data = list(Student.objects.values())
        return JsonResponse({"data": data})
    else:
        return handler404(request, "404")


def format_response_data(data):
    d = data.decode("utf-8")
    d = json.loads(d)
    return d


def is_attendance_complete(request):
    if request.method == "POST":
        data = format_response_data(request.body)

        practitioner = Practitioner.objects.get(student=data["dni"])

        if Attendance.objects.filter(
            practitioner=practitioner,
            log_date=data["log_date"],
        ).exists():
            att = Attendance.objects.get(
                practitioner=practitioner, log_date=data["log_date"]
            )
            if att.exit_time is None:
                return JsonResponse({"exists": False})
            else:
                return JsonResponse({"exists": True, "data": att.to_dict()})
        else:
            return JsonResponse({"exists": False})
    return handler404(request, "404")


def is_only_set_entry_time(request):
    if request.method == "POST":
        data = format_response_data(request.body)

        practitioner = Practitioner.objects.get(student=data["dni"])

        if Attendance.objects.filter(
            practitioner=practitioner,
            log_date=data["log_date"],
        ).exists():
            att = Attendance.objects.get(
                practitioner=practitioner, log_date=data["log_date"]
            )
            if att.entry_time is not None and att.exit_time is None:
                return JsonResponse({"exists": True})
            else:
                return JsonResponse({"exists": False})
        else:
            return JsonResponse({"exists": False})
    return handler404(request, "404")


def create_attendance(request):
    if request.method == "POST":
        data = format_response_data(request.body)

        practitioner = Practitioner.objects.get(student=data["dni"])

        att = Attendance.objects.create(
            log_date=data["log_date"],
            entry_time=data["entry_time"],
            practitioner=practitioner,
        )
        att.save()

        if Attendance.objects.filter(id=att.id).exists():
            attendance = Attendance.objects.get(id=att.id)

            return JsonResponse({"created": True, "data": attendance.to_dict()})
        else:
            return JsonResponse({"created": False})
    return handler404(request, "404")


def set_exit_time(request):
    if request.method == "POST":
        data = format_response_data(request.body)

        practitioner = Practitioner.objects.get(student=data["dni"])

        if Attendance.objects.filter(
            practitioner=practitioner, log_date=data["log_date"]
        ).exists():
            att_updated = Attendance.objects.filter(
                practitioner=practitioner, log_date=data["log_date"]
            ).update(exit_time=data["exit_time"])

            if att_updated == 1:
                attendance = Attendance.objects.get(
                    practitioner=practitioner, log_date=data["log_date"]
                )
                return JsonResponse({"updated": True, "data": attendance.to_dict()})
            else:
                return JsonResponse({"updated": False})
        else:
            return JsonResponse({"updated": False})
    return handler404(request, "404")
