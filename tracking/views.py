from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import StatusHistory
from deliveries.models import Delivery


class DeliveryTrackingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, delivery_id):
        try:
            delivery = Delivery.objects.get(id=delivery_id)
        except Delivery.DoesNotExist:
            return Response({"error": "Delivery not found."}, status=status.HTTP_404_NOT_FOUND)

        user_role = getattr(request.user, "role", None)

        if user_role == "RETAILER":
            if delivery.retailer != request.user:
                return Response({"error": "You do not have access to this delivery."}, status=status.HTTP_403_FORBIDDEN)

        elif user_role == "RIDER":
            if delivery.rider != request.user:
                return Response({"error": "You do not have access to this delivery."}, status=status.HTTP_403_FORBIDDEN)

        elif user_role != "DISPATCHER":
            return Response({"error": "You do not have permission to view this delivery."}, status=status.HTTP_403_FORBIDDEN)

        history = StatusHistory.objects.filter(delivery=delivery).order_by("changed_at")

        data = [
            {
                "old_status": r.old_status,
                "new_status": r.new_status,
                "changed_by": r.changed_by.username,
                "changed_at": r.changed_at,
            }
            for r in history
        ]

        return Response({
            "delivery": {
                "id": delivery.id,
                "customer_name": delivery.customer_name,
                "address": delivery.address,
                "current_status": delivery.status,
            },
            "history": data,
        }, status=status.HTTP_200_OK)