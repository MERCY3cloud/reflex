from django.urls import path

from .views import (
DeliveryCreateView,
DeliveryListView,
PendingDeliveriesView,
VerifyLocationView,
AssignRiderView,
RidersListView,
MyDeliveriesView,
UpdateDeliveryStatusView,
DeliveryDetailView,
)

urlpatterns = [
path(
"create/",
DeliveryCreateView.as_view(),
name="delivery-create",
),


path(
    "pending/",
    PendingDeliveriesView.as_view(),
    name="pending-deliveries",
),

path(
    "riders/",
    RidersListView.as_view(),
    name="riders-list",
),

path(
    "my/",
    MyDeliveriesView.as_view(),
    name="my-deliveries",
),

path(
    "<int:delivery_id>/verify-location/",
    VerifyLocationView.as_view(),
    name="verify-location",
),

path(
    "<int:delivery_id>/",
    DeliveryDetailView.as_view(),
    name="delivery-detail",
),

path(
    "<int:delivery_id>/assign-rider/",
    AssignRiderView.as_view(),
    name="assign-rider",
),

path(
    "<int:delivery_id>/status/",
    UpdateDeliveryStatusView.as_view(),
    name="update-delivery-status",
),

path(
    "",
    DeliveryListView.as_view(),
    name="delivery-list",
),


]
