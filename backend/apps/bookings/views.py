from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking, Contract
from .serializers import (
    BookingSerializer,
    BookingCreateSerializer,
    ContractSerializer,
    ContractSignSerializer,
)
from apps.nannies.models import NannyProfile


class BookingListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related(
            'family__user', 'nanny__user'
        ).prefetch_related('nanny__languages', 'nanny__specializations')

        if user.role == 'family':
            qs = qs.filter(family__user=user)
        elif user.role == 'nanny':
            qs = qs.filter(nanny__user=user)
        else:
            # Admin sees all
            pass

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        return qs


class BookingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'family':
            return Response(
                {'detail': 'Only families can create bookings.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        nanny_profile = NannyProfile.objects.get(id=data['nanny_id'])
        family_profile = request.user.family_profile

        booking = Booking.objects.create(
            family=family_profile,
            nanny=nanny_profile,
            booking_type=data['booking_type'],
            start_date=data['start_date'],
            end_date=data.get('end_date'),
            start_time=data.get('start_time'),
            end_time=data.get('end_time'),
            hours_per_week=data.get('hours_per_week'),
            hourly_rate=nanny_profile.hourly_rate,
            currency=nanny_profile.currency,
            notes=data.get('notes', ''),
        )

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )


class BookingDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related('family__user', 'nanny__user')
        if user.role == 'family':
            return qs.filter(family__user=user)
        elif user.role == 'nanny':
            return qs.filter(nanny__user=user)
        return qs


class BookingStatusView(APIView):
    permission_classes = [IsAuthenticated]

    VALID_TRANSITIONS = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['in_progress', 'cancelled'],
        'in_progress': ['completed', 'disputed'],
        'completed': [],
        'cancelled': [],
        'disputed': ['completed', 'cancelled'],
    }

    def patch(self, request, pk):
        user = request.user
        try:
            booking = Booking.objects.select_related(
                'family__user', 'nanny__user'
            ).get(
                Q(pk=pk),
                Q(family__user=user) | Q(nanny__user=user) | Q(family__user__role='admin'),
            )
        except Booking.DoesNotExist:
            return Response(
                {'detail': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_status = request.data.get('status')
        if not new_status:
            return Response(
                {'detail': 'status field is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid = self.VALID_TRANSITIONS.get(booking.status, [])
        if new_status not in valid:
            return Response(
                {'detail': f'Cannot transition from {booking.status} to {new_status}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Nanny confirms, family or nanny can cancel
        if new_status == 'confirmed' and user.role != 'nanny':
            return Response(
                {'detail': 'Only the nanny can confirm a booking.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        booking.status = new_status
        if new_status == 'cancelled':
            booking.cancelled_by = user
            booking.cancellation_reason = request.data.get('reason', '')
        booking.save()

        return Response(BookingSerializer(booking).data)


class ContractView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        try:
            contract = Contract.objects.select_related('booking').get(
                booking_id=booking_id
            )
        except Contract.DoesNotExist:
            return Response(
                {'detail': 'Contract not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(ContractSerializer(contract).data)

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response(
                {'detail': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if hasattr(booking, 'contract'):
            return Response(
                {'detail': 'Contract already exists for this booking.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        contract = Contract.objects.create(
            booking=booking,
            terms=request.data.get('terms', ''),
            special_conditions=request.data.get('special_conditions', ''),
        )
        return Response(
            ContractSerializer(contract).data,
            status=status.HTTP_201_CREATED,
        )


class ContractSignView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        user = request.user
        serializer = ContractSignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            contract = Contract.objects.select_related(
                'booking__family__user', 'booking__nanny__user'
            ).get(booking_id=booking_id)
        except Contract.DoesNotExist:
            return Response(
                {'detail': 'Contract not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        signature = serializer.validated_data['signature']
        now = timezone.now()

        if user == contract.booking.family.user:
            if contract.family_signed:
                return Response(
                    {'detail': 'Family has already signed.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            contract.family_signed = True
            contract.family_signed_at = now
            contract.family_signature = signature
        elif user == contract.booking.nanny.user:
            if contract.nanny_signed:
                return Response(
                    {'detail': 'Nanny has already signed.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            contract.nanny_signed = True
            contract.nanny_signed_at = now
            contract.nanny_signature = signature
        else:
            return Response(
                {'detail': 'You are not a party to this contract.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        contract.save()
        return Response(ContractSerializer(contract).data)
