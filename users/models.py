from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        RETAILER = "RETAILER", "Retailer"
        DISPATCHER = "DISPATCHER", "Dispatcher"
        RIDER = "RIDER", "Rider"

    role = models.CharField(
        max_length=20,
        choices=Role.choices
    )

    phone = models.CharField(
        max_length=20,
        blank=True
    )

    def __str__(self):
        return f"{self.username} - {self.role}"
