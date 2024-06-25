import re
import enum
from django.db import models
from django.core.exceptions import ValidationError
from datetime import date
from django.db.models import ManyToManyField, DateTimeField


def validate_names(names):
    return bool(re.search(r"^[a-zA-Z ]+$", names))


class StudyCenter(models.Model):
    name = models.CharField(
        max_length=50, null=False, verbose_name="Centro de estudios", unique=True
    )

    def __str__(self) -> str:
        return self.name.upper()

    class Meta:
        verbose_name = "Centro de estudios"
        verbose_name_plural = "Centros de estudios"


class Career(models.Model):
    name = models.CharField(max_length=50, null=False, verbose_name="Carrera")
    study_center = models.ForeignKey(
        StudyCenter, on_delete=models.PROTECT, verbose_name="Centro de estudios"
    )

    def __str__(self) -> str:
        return f"{self.name} - {self.study_center.name}"

    class Meta:
        verbose_name = "Carrera"
        verbose_name_plural = "Carreras"


class Sexes(enum.Enum):
    MALE = "Masculino"
    FEMALE = "Femenino"

    @classmethod
    def choices(cls):
        return tuple((i.name, i.value) for i in cls)


class Student(models.Model):
    dni = models.CharField(
        max_length=8, unique=True, null=False, primary_key=True, verbose_name="Dni"
    )
    first_name = models.CharField(
        max_length=50, null=False, verbose_name="Nombres")
    last_name = models.CharField(
        max_length=50, null=False, verbose_name="Apellidos")
    phone = models.CharField(
        max_length=9, null=False, verbose_name="Celular", unique=True
    )
    birthdate = models.DateField(
        null=False, verbose_name="Fecha de nacimiento")
    sex = models.CharField(choices=Sexes.choices(),
                           max_length=9, verbose_name="Sexo")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def clean(self):
        if not len(self.dni) == 8:
            raise ValidationError({"dni": "Dni deberia de tener 8 caracteres"})
        if not self.dni.isdigit():
            raise ValidationError({"dni": "Dni deberia de ser solo numeros"})
        if not len(self.phone) == 9:
            raise ValidationError(
                {"phone": "El celular debe de tener 9 digitos"})
        if not self.phone.isdigit():
            raise ValidationError(
                {"phone": "El celular debe de ser solo numeros"})
        if len(self.first_name) < 3:
            raise ValidationError(
                {"first_name": "El nombre debe de tener al menos 3 caracteres"}
            )
        if not validate_names(self.first_name):
            raise ValidationError(
                {"first_name": "El nombre solo puede contener letras"}
            )
        if len(self.last_name) < 3:
            raise ValidationError(
                {"last_name": "El apellido debe de tener al menos 3 caracteres"}
            )
        if not validate_names(self.last_name):
            raise ValidationError(
                {"last_name": "El apellido solo puede contener letras"}
            )
        if self.birthdate >= date.today():
            raise ValidationError(
                {"birthdate": "Fecha de nacimiento no puede ser mayor a la actual"}
            )
        if (date.today().year - self.birthdate.year) < 12:
            raise ValidationError(
                {"birthdate": "El practicante debe de tener mas de 12 años"}
            )
        if self.birthdate < date(1950, 1, 1):
            raise ValidationError(
                {"birthdate": "La fecha de nacimiento no puede ser menor a 1950"}
            )
        if (date.today().year - self.birthdate.year) > 50:
            raise ValidationError(
                {"birthdate": "El practicante debe de tener menos de 50 años"}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Estudiante"
        verbose_name_plural = "Estudiantes"


class Turn(enum.Enum):
    MORNING = "Mañana"
    AFTERNOON = "Tarde"

    @classmethod
    def choices(cls):
        return tuple((i.name, i.value) for i in cls)


# Create your models here.
class Practitioner(models.Model):
    internship_start_date = models.DateField(
        null=False, verbose_name="Fecha de inicio de practicas"
    )
    internship_end_date = models.DateField(
        null=False, verbose_name="Fecha final de practicas"
    )
    turn = models.CharField(
        choices=Turn.choices(), default=Turn.MORNING, max_length=9, verbose_name="Turno"
    )
    student = models.OneToOneField(
        Student, on_delete=models.CASCADE, primary_key=True, verbose_name="Datos personales"
    )
    career = models.ForeignKey(
        Career, on_delete=models.PROTECT, verbose_name="Carrera")

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name}"

    def clean(self):
        if self.internship_start_date == None:
            raise ValidationError(
                {"internship_start_date": "Fecha de inicio de practicas no estar vacia"}
            )
        if self.internship_end_date == None:
            raise ValidationError(
                {"internship_end_date": "Fecha de final de practicas no puede estar vacia"}
            )
        if self.internship_start_date >= self.internship_end_date:
            raise ValidationError(
                {
                    "internship_start_date": "Fecha de inicio no puede ser mayor o igual a la final"
                }
            )
        if self.internship_end_date <= self.internship_start_date:
            raise ValidationError(
                {
                    "internship_end_date": "Fecha de final no puede ser menor o igual a la inicial"
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Practicante"
        verbose_name_plural = "Practicantes"


class Attendance(models.Model):
    log_date = models.DateField(null=False, verbose_name="Fecha")
    entry_time = models.TimeField(null=False, verbose_name="Hora de entrada")
    exit_time = models.TimeField(
        null=True, verbose_name="Hora de salida", blank=True)
    practitioner = models.ForeignKey(
        Practitioner, on_delete=models.CASCADE, verbose_name="Practicante"
    )

    class Meta:
        verbose_name = "Asistencia"
        verbose_name_plural = "Asistencias"

    def __str__(self):
        return f"{self.practitioner.student.first_name} {self.practitioner.student.last_name}"

    def to_dict(self):
        data = {}
        opts = self._meta
        for f in opts.concrete_fields + opts.many_to_many:
            if isinstance(f, ManyToManyField):
                if self.pk is None:
                    data[f.name] = []
                else:
                    data[f.name] = list(f.value_from_object(
                        self).values_list('pk', flat=True))
            elif isinstance(f, DateTimeField):
                if f.value_from_object(self) is not None:
                    data[f.name] = f.value_from_object(self).isoformat()
                else:
                    data[f.name] = None
            else:
                data[f.name] = f.value_from_object(self)
        return data
