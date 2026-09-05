from django.urls import path

from .views import DeliveryTrackingView

urlpatterns = [
	path(
		"deliveries/<int:delivery_id>/",
		DeliveryTrackingView.as_view(),
		name="delivery-tracking",
	),
]