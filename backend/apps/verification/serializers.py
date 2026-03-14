from rest_framework import serializers

from .models import VerificationRecord, Reference


class VerificationRecordSerializer(serializers.ModelSerializer):
    step_display = serializers.CharField(source='get_step_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = VerificationRecord
        fields = [
            'id', 'nanny', 'step', 'step_display', 'status', 'status_display',
            'provider_reference', 'notes', 'rejection_reason',
            'reviewed_by', 'submitted_at', 'reviewed_at', 'expires_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'nanny', 'reviewed_by', 'reviewed_at',
            'created_at', 'updated_at',
        ]


class ReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reference
        fields = [
            'id', 'nanny', 'referee_name', 'referee_email', 'referee_phone',
            'relationship', 'employer_name', 'years_known',
            'reference_text', 'is_verified', 'verified_by', 'verified_at',
            'created_at',
        ]
        read_only_fields = [
            'nanny', 'is_verified', 'verified_by', 'verified_at', 'created_at',
        ]


class ReferenceCreateSerializer(serializers.Serializer):
    referee_name = serializers.CharField(max_length=200)
    referee_email = serializers.EmailField()
    referee_phone = serializers.CharField(max_length=20, required=False, default='')
    relationship = serializers.CharField(max_length=100)
    employer_name = serializers.CharField(max_length=200, required=False, default='')
    years_known = serializers.IntegerField(min_value=0, required=False, default=0)
    reference_text = serializers.CharField(required=False, default='')
