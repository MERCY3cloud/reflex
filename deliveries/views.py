from decimal import Decimal, InvalidOperation
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Delivery
from tracking.models import StatusHistory
from django.utils import timezone
from users.models import User


class DeliveryCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if getattr(request.user, "role", None) != "RETAILER":
            return Response({"error": "Only retailers can create deliveries."}, status=status.HTTP_403_FORBIDDEN)

        total_amount_raw = request.data.get("total_amount")
        deposit_raw = request.data.get("deposit_paid", 0)
        quantity_raw = request.data.get("quantity", 1)

        # total_amount is required and must be a valid number
        if total_amount_raw is None or str(total_amount_raw).strip() == "":
            return Response({"error": "total_amount is required."}, status=status.HTTP_400_BAD_REQUEST)

        # normalize empty deposit/quantity to defaults
        if deposit_raw is None or str(deposit_raw).strip() == "":
            deposit_raw = 0
        if quantity_raw is None or str(quantity_raw).strip() == "":
            quantity_raw = 1

        try:
            total_amount = Decimal(str(total_amount_raw))
            deposit_paid = Decimal(str(deposit_raw))
            quantity = int(quantity_raw)
        except (InvalidOperation, TypeError, ValueError):
            return Response({"error": "Invalid numeric value in total_amount, deposit_paid or quantity."}, status=status.HTTP_400_BAD_REQUEST)

        delivery = Delivery.objects.create(
            customer_name=request.data.get("customer_name"),
            customer_phone=request.data.get("customer_phone"),
            address=request.data.get("address"),
            item_description=request.data.get("item_description"),
            quantity=quantity,
            total_amount=total_amount,
            deposit_paid=deposit_paid,
            balance_paid=Decimal("0.00"),
            retailer=request.user,
        )

        # initial status history: created
        StatusHistory.objects.create(
            delivery=delivery,
            old_status="",
            new_status=delivery.status,
            changed_by=request.user,
        )

        return Response({
            "message": "Delivery created successfully.",
            "delivery": {
                "id": delivery.id,
                "customer_name": delivery.customer_name,
                "customer_phone": delivery.customer_phone,
                "address": delivery.address,
                "item_description": delivery.item_description,
                "total_amount": str(delivery.total_amount),
                "deposit_paid": str(delivery.deposit_paid),
                "balance_paid": str(delivery.balance_paid),
                "balance": str(delivery.balance),
                "quantity": delivery.quantity,
                "assigned_at": delivery.assigned_at,
                "delivered_at": delivery.delivered_at,
                "status": delivery.status,
                "retailer": delivery.retailer.username,
                "created_at": delivery.created_at,
            },
        }, status=status.HTTP_201_CREATED)


class PendingDeliveriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, "role", None) != "DISPATCHER":
            return Response({"error": "Only dispatchers can view pending deliveries."}, status=status.HTTP_403_FORBIDDEN)

        deliveries = Delivery.objects.filter(status=Delivery.Status.CREATED).order_by("-created_at")

        data = [
            {
                "id": d.id,
                "customer_name": d.customer_name,
                "customer_phone": d.customer_phone,
                "address": d.address,
                "item_description": d.item_description,
                "total_amount": str(d.total_amount),
                "deposit_paid": str(d.deposit_paid),
                "balance_paid": str(d.balance_paid),
                "status": d.status,
                "retailer": d.retailer.username,
                "created_at": d.created_at,
            }
            for d in deliveries
        ]

        return Response({"deliveries": data}, status=status.HTTP_200_OK)


class VerifyLocationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, delivery_id):
        delivery = get_object_or_404(Delivery, id=delivery_id)

        user_role = getattr(request.user, "role", None)
        if request.user != delivery.retailer and user_role not in ("DISPATCHER", "RIDER"):
            return Response({"error": "Not authorized to verify location."}, status=status.HTTP_403_FORBIDDEN)

        if delivery.status != Delivery.Status.CREATED:
            return Response({"error": "Only deliveries with CREATED status can be location verified."}, status=status.HTTP_400_BAD_REQUEST)

        old = delivery.status
        delivery.status = Delivery.Status.LOCATION_VERIFIED
        delivery.save(update_fields=["status"])

        # record status history
        StatusHistory.objects.create(
            delivery=delivery,
            old_status=old,
            new_status=delivery.status,
            changed_by=request.user,
        )

        return Response({"message": "Location verified.", "delivery": {"id": delivery.id, "status": delivery.status, "address": delivery.address, "customer_name": delivery.customer_name}}, status=status.HTTP_200_OK)


class AssignRiderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, delivery_id):
        if getattr(request.user, "role", None) != "DISPATCHER":
            return Response({"error": "Only dispatchers can assign riders."}, status=status.HTTP_403_FORBIDDEN)

        try:
            delivery = Delivery.objects.get(id=delivery_id)
        except Delivery.DoesNotExist:
            return Response({"error": "Delivery not found."}, status=status.HTTP_404_NOT_FOUND)

        if delivery.status != Delivery.Status.LOCATION_VERIFIED:
            return Response({"error": "The delivery location must be verified before assigning a rider."}, status=status.HTTP_400_BAD_REQUEST)

        rider_id = request.data.get("rider_id")
        if not rider_id:
            return Response({"error": "rider_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rider = User.objects.get(id=rider_id, role=User.Role.RIDER)
        except User.DoesNotExist:
            return Response({"error": "Rider not found."}, status=status.HTTP_404_NOT_FOUND)

        old = delivery.status
        delivery.rider = rider
        delivery.status = Delivery.Status.ASSIGNED
        delivery.assigned_at = timezone.now()
        delivery.save(update_fields=["rider", "status", "assigned_at"])

        StatusHistory.objects.create(
            delivery=delivery,
            old_status=old,
            new_status=delivery.status,
            changed_by=request.user,
        )

        return Response({"message": "Rider assigned successfully.", "delivery": {"id": delivery.id, "status": delivery.status, "rider": rider.username, "customer_name": delivery.customer_name, "address": delivery.address}}, status=status.HTTP_200_OK)


class RidersListView(APIView):
    """Return list of active users with role RIDER. Only accessible by DISPATCHER."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, "role", None) != "DISPATCHER":
            return Response({"error": "Only dispatchers can view riders."}, status=status.HTTP_403_FORBIDDEN)

        riders_qs = User.objects.filter(role=User.Role.RIDER)
        data = [
            {
                "id": r.id,
                "username": r.username,
                "first_name": r.first_name,
                "last_name": r.last_name,
            }
            for r in riders_qs
        ]

        return Response({"riders": data}, status=status.HTTP_200_OK)
class MyDeliveriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_role = getattr(request.user, "role", None)

        if user_role == "RETAILER":
            deliveries = Delivery.objects.filter(
                retailer=request.user
            ).order_by("-created_at")

        elif user_role == "RIDER":
            deliveries = Delivery.objects.filter(
                rider=request.user
            ).exclude(
                status=Delivery.Status.DELIVERED
            ).order_by("-created_at")

        else:
            return Response(
                {
                    "error": "This endpoint is only available to retailers and riders."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        data = [
            {
                "id": d.id,
                "customer_name": d.customer_name,
                "customer_phone": d.customer_phone,
                "address": d.address,
                "item_description": d.item_description,
                "total_amount": str(d.total_amount),
                "deposit_paid": str(d.deposit_paid),
                "balance_paid": str(d.balance_paid),
                "status": d.status,
                "retailer": d.retailer.username,
                "rider": d.rider.username if d.rider else None,
                "created_at": d.created_at,
            }
            for d in deliveries
        ]

        return Response(
            {"deliveries": data},
            status=status.HTTP_200_OK
        )

class UpdateDeliveryStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, delivery_id):
        if getattr(request.user, "role", None) != "RIDER":
            return Response({"error": "Only riders can update delivery status."}, status=status.HTTP_403_FORBIDDEN)

        try:
            delivery = Delivery.objects.get(id=delivery_id, rider=request.user)
        except Delivery.DoesNotExist:
            return Response({"error": "Delivery not found or not assigned to you."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")

        allowed_transitions = {
            Delivery.Status.ASSIGNED: Delivery.Status.PICKED_UP,
            Delivery.Status.PICKED_UP: Delivery.Status.IN_TRANSIT,
            Delivery.Status.IN_TRANSIT: Delivery.Status.DELIVERED,
        }

        expected_next_status = allowed_transitions.get(delivery.status)

        if new_status != expected_next_status:
            return Response({"error": (f"Invalid status transition. Current status is {delivery.status}. Expected next status is {expected_next_status}.")}, status=status.HTTP_400_BAD_REQUEST)

        old = delivery.status
        delivery.status = new_status
        if new_status == Delivery.Status.DELIVERED:
            delivery.delivered_at = timezone.now()
            delivery.save(update_fields=["status", "delivered_at"])
        else:
            delivery.save(update_fields=["status"])

        StatusHistory.objects.create(
            delivery=delivery,
            old_status=old,
            new_status=delivery.status,
            changed_by=request.user,
        )

        return Response({"message": "Delivery status updated successfully.", "delivery": {"id": delivery.id, "customer_name": delivery.customer_name, "status": delivery.status, "rider": request.user.username}}, status=status.HTTP_200_OK)

class DeliveryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_role = getattr(request.user, "role", None)

        if user_role == "RETAILER":
            deliveries = Delivery.objects.filter(retailer=request.user).order_by("-created_at")

        elif user_role == "DISPATCHER":
            deliveries = Delivery.objects.exclude(status=Delivery.Status.DELIVERED).order_by("-created_at")

        elif user_role == "RIDER":
            deliveries = Delivery.objects.filter(rider=request.user).order_by("-created_at")

        else:
            return Response({"error": "Invalid user role."}, status=status.HTTP_403_FORBIDDEN)

        data = [
            {
                "id": d.id,
                "customer_name": d.customer_name,
                "customer_phone": d.customer_phone,
                "address": d.address,
                "item_description": d.item_description,
                "total_amount": str(d.total_amount),
                "deposit_paid": str(d.deposit_paid),
                "balance_paid": str(d.balance_paid),
                "status": d.status,
                "retailer": d.retailer.username,
                "rider": d.rider.username if d.rider else None,
                "created_at": d.created_at,
            }
            for d in deliveries
        ]

        return Response({"deliveries": data}, status=status.HTTP_200_OK)
class RetailerDeliveryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, "role", None) != "RETAILER":
            return Response({"error": "Only retailers can view retailer deliveries."}, status=status.HTTP_403_FORBIDDEN)

        deliveries = Delivery.objects.filter(retailer=request.user).order_by("-created_at")

        data = [
            {
                "id": d.id,
                "customer_name": d.customer_name,
                "customer_phone": d.customer_phone,
                "address": d.address,
                "item_description": d.item_description,
                "total_amount": str(d.total_amount),
                "deposit_paid": str(d.deposit_paid),
                "balance_paid": str(d.balance_paid),
                "status": d.status,
                "created_at": d.created_at,
            }
            for d in deliveries
        ]

        return Response({"deliveries": data}, status=status.HTTP_200_OK)


class DeliveryDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, delivery_id):
        delivery = get_object_or_404(Delivery, id=delivery_id)

        # role-based access: retailers can view own, dispatchers can view all, riders only assigned
        user_role = getattr(request.user, "role", None)
        if user_role == "RETAILER" and delivery.retailer != request.user:
            return Response({"error": "Not authorized to view this delivery."}, status=status.HTTP_403_FORBIDDEN)
        if user_role == "RIDER" and delivery.rider != request.user:
            return Response({"error": "Not authorized to view this delivery."}, status=status.HTTP_403_FORBIDDEN)

        # include available riders for dispatcher
        riders = []
        if user_role == "DISPATCHER":
            riders_qs = User.objects.filter(role=User.Role.RIDER)
            riders = [{"id": r.id, "username": r.username} for r in riders_qs]

        history = [
            {
                "old_status": h.old_status,
                "new_status": h.new_status,
                "changed_by": h.changed_by.username,
                "changed_at": h.changed_at,
            }
            for h in delivery.status_history.order_by("changed_at")
        ]

        data = {
            "id": delivery.id,
            "customer_name": delivery.customer_name,
            "customer_phone": delivery.customer_phone,
            "address": delivery.address,
            "item_description": delivery.item_description,
            "quantity": delivery.quantity,
            "total_amount": str(delivery.total_amount),
            "deposit_paid": str(delivery.deposit_paid),
            "balance": str(delivery.balance),
            "status": delivery.status,
            "retailer": delivery.retailer.username,
            "rider": delivery.rider.username if delivery.rider else None,
            "rider_id": delivery.rider.id if delivery.rider else None,
            "assigned_at": delivery.assigned_at,
            "delivered_at": delivery.delivered_at,
            "history": history,
            "available_riders": riders,
        }

        return Response({"delivery": data}, status=status.HTTP_200_OK)