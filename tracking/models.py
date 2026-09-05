from django.conf import settings
from django.db import models


class StatusHistory(models.Model):
    delivery = models.ForeignKey(
        "deliveries.Delivery",
        on_delete=models.CASCADE,
        related_name="status_history",
    )

    old_status = models.CharField(max_length=25)
    new_status = models.CharField(max_length=25)

    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="status_changes",
    )

    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Delivery #{self.delivery.id}: {self.old_status} → {self.new_status}"
