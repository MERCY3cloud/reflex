from django.conf import settings
from django.db import models


class Delivery(models.Model):

    class Status(models.TextChoices):
        CREATED = "CREATED", "Created"
        LOCATION_VERIFIED = "LOCATION_VERIFIED", "Location Verified"
        ASSIGNED = "ASSIGNED", "Assigned"
        PICKED_UP = "PICKED_UP", "Picked Up"
        IN_TRANSIT = "IN_TRANSIT", "In Transit"
        DELIVERED = "DELIVERED", "Delivered"

    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=20)
    address = models.TextField()
    item_description = models.TextField()
    quantity = models.PositiveIntegerField(default=1)

    total_amount = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    default=0
)

    deposit_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    balance_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    # Computed remaining balance = total_amount - deposit_paid
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.CREATED
    )

    retailer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="deliveries"
    )
    rider = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_deliveries"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Delivery #{self.id} - {self.customer_name}"

    def save(self, *args, **kwargs):
        # Ensure balance is always total_amount - deposit_paid
        try:
            self.balance = self.total_amount - self.deposit_paid
        except Exception:
            pass
        super().save(*args, **kwargs)
