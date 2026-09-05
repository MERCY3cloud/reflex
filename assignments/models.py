from django.conf import settings
from django.db import models


class Assignment(models.Model):

    delivery = models.OneToOneField(
        "deliveries.Delivery",
        on_delete=models.CASCADE,
        related_name="assignment"
    )

    rider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_assignments"
    )

    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Delivery #{self.delivery.id} → {self.rider.username}"