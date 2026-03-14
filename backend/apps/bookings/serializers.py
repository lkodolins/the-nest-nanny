from rest_framework import serializers

from .models import Booking, Contract
from apps.accounts.serializers import UserSerializer
from apps.nannies.serializers import NannyCardSerializer
from apps.families.serializers import FamilyProfileSerializer


class BookingSerializer(serializers.ModelSerializer):
    family_user = serializers.SerializerMethodField()
    nanny_card = NannyCardSerializer(source='nanny', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'family', 'nanny', 'family_user', 'nanny_card',
            'booking_type', 'status', 'start_date', 'end_date',
            'start_time', 'end_time', 'hours_per_week',
            'hourly_rate', 'total_amount', 'currency',
            'notes', 'cancellation_reason',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'family', 'nanny', 'hourly_rate', 'total_amount',
            'currency', 'status', 'created_at', 'updated_at',
        ]

    def get_family_user(self, obj):
        return UserSerializer(obj.family.user).data


class BookingCreateSerializer(serializers.Serializer):
    nanny_id = serializers.IntegerField()
    booking_type = serializers.ChoiceField(choices=Booking.TYPE_CHOICES)
    start_date = serializers.DateField()
    end_date = serializers.DateField(required=False, allow_null=True)
    start_time = serializers.TimeField(required=False, allow_null=True)
    end_time = serializers.TimeField(required=False, allow_null=True)
    hours_per_week = serializers.DecimalField(
        max_digits=5, decimal_places=1, required=False, allow_null=True
    )
    notes = serializers.CharField(required=False, default='')

    def validate_nanny_id(self, value):
        from apps.nannies.models import NannyProfile
        try:
            NannyProfile.objects.get(id=value)
        except NannyProfile.DoesNotExist:
            raise serializers.ValidationError('Nanny not found.')
        return value


class ContractSerializer(serializers.ModelSerializer):
    is_fully_signed = serializers.BooleanField(read_only=True)

    class Meta:
        model = Contract
        fields = [
            'id', 'booking', 'terms', 'special_conditions',
            'family_signed', 'family_signed_at', 'family_signature',
            'nanny_signed', 'nanny_signed_at', 'nanny_signature',
            'is_active', 'is_fully_signed',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'family_signed', 'family_signed_at',
            'nanny_signed', 'nanny_signed_at',
            'is_active', 'created_at', 'updated_at',
        ]


class ContractSignSerializer(serializers.Serializer):
    signature = serializers.CharField()
