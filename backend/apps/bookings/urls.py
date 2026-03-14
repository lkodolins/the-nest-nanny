from django.urls import path

from .views import (
    BookingListView,
    BookingCreateView,
    BookingDetailView,
    BookingStatusView,
    ContractView,
    ContractSignView,
)

urlpatterns = [
    path('', BookingListView.as_view(), name='booking-list'),
    path('create/', BookingCreateView.as_view(), name='booking-create'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/status/', BookingStatusView.as_view(), name='booking-status'),
    path('<int:booking_id>/contract/', ContractView.as_view(), name='booking-contract'),
    path('<int:booking_id>/contract/sign/', ContractSignView.as_view(), name='contract-sign'),
]
