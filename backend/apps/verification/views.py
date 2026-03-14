import uuid

from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import VerificationRecord, Reference
from .serializers import (
    VerificationRecordSerializer,
    ReferenceSerializer,
    ReferenceCreateSerializer,
)


class IsNanny(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'nanny'


class VerificationStatusView(APIView):
    permission_classes = [IsNanny]

    def get(self, request):
        nanny_profile = request.user.nanny_profile
        records = VerificationRecord.objects.filter(nanny=nanny_profile)

        # Ensure all steps exist
        existing_steps = set(records.values_list('step', flat=True))
        all_steps = [c[0] for c in VerificationRecord.STEP_CHOICES]
        for step in all_steps:
            if step not in existing_steps:
                VerificationRecord.objects.create(
                    nanny=nanny_profile, step=step, status='not_started'
                )

        records = VerificationRecord.objects.filter(nanny=nanny_profile)
        return Response(VerificationRecordSerializer(records, many=True).data)


class StartIdentityVerificationView(APIView):
    permission_classes = [IsNanny]

    def post(self, request):
        nanny_profile = request.user.nanny_profile

        record, created = VerificationRecord.objects.get_or_create(
            nanny=nanny_profile, step='identity',
            defaults={'status': 'not_started'},
        )

        if record.status in ('approved', 'pending', 'in_progress'):
            return Response(
                {'detail': f'Identity verification is already {record.status}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mock Stripe Identity verification session
        mock_session_id = f'vs_mock_{uuid.uuid4().hex[:16]}'

        record.status = 'pending'
        record.provider_reference = mock_session_id
        record.submitted_at = timezone.now()
        record.save()

        return Response({
            'verification_record': VerificationRecordSerializer(record).data,
            'verification_url': f'https://verify.stripe.com/mock/{mock_session_id}',
        })


class StartVerificationStepView(APIView):
    """Start verification for any step type (identity, background_check, certifications)."""
    permission_classes = [IsNanny]

    def post(self, request, step):
        valid_steps = [c[0] for c in VerificationRecord.STEP_CHOICES]
        if step not in valid_steps:
            return Response(
                {'detail': f'Invalid step: {step}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        nanny_profile = request.user.nanny_profile
        record, created = VerificationRecord.objects.get_or_create(
            nanny=nanny_profile, step=step,
            defaults={'status': 'not_started'},
        )

        if record.status in ('approved', 'pending', 'in_progress'):
            return Response(
                {
                    'detail': f'{record.get_step_display()} is already {record.get_status_display().lower()}.',
                    'already_started': True,
                    'verification_record': VerificationRecordSerializer(record).data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        mock_session_id = f'vs_mock_{uuid.uuid4().hex[:16]}'
        record.status = 'pending'
        record.provider_reference = mock_session_id
        record.submitted_at = timezone.now()
        record.save()

        return Response({
            'verification_record': VerificationRecordSerializer(record).data,
            'verification_url': f'https://verify.stripe.com/mock/{mock_session_id}',
        })


class SubmitReferenceView(APIView):
    permission_classes = [IsNanny]

    def post(self, request):
        serializer = ReferenceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        nanny_profile = request.user.nanny_profile
        reference = Reference.objects.create(
            nanny=nanny_profile,
            **serializer.validated_data,
        )

        # Update references verification step to pending
        record, _ = VerificationRecord.objects.get_or_create(
            nanny=nanny_profile, step='references',
            defaults={'status': 'not_started'},
        )
        if record.status == 'not_started':
            record.status = 'pending'
            record.submitted_at = timezone.now()
            record.save()

        return Response(
            ReferenceSerializer(reference).data,
            status=status.HTTP_201_CREATED,
        )


class AdminVerificationQueueView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = VerificationRecordSerializer

    def get_queryset(self):
        return VerificationRecord.objects.filter(
            status='pending'
        ).select_related('nanny__user').order_by('submitted_at')


class AdminVerificationUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            record = VerificationRecord.objects.select_related(
                'nanny__user'
            ).get(id=pk)
        except VerificationRecord.DoesNotExist:
            return Response(
                {'detail': 'Verification record not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_status = request.data.get('status')
        if new_status not in ('approved', 'rejected'):
            return Response(
                {'detail': 'Status must be approved or rejected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()
        record.status = new_status
        record.reviewed_by = request.user
        record.reviewed_at = now
        if new_status == 'rejected':
            record.rejection_reason = request.data.get('rejection_reason', '')
        record.save()

        # Check if all steps are approved for this nanny
        nanny_profile = record.nanny
        all_approved = not VerificationRecord.objects.filter(
            nanny=nanny_profile
        ).exclude(status='approved').exists()

        if all_approved:
            nanny_profile.is_verified = True
            nanny_profile.verification_date = now
            nanny_profile.save(update_fields=['is_verified', 'verification_date'])

        return Response(VerificationRecordSerializer(record).data)
