from rest_framework import serializers

from .models import EscrowPayment, Subscription, Payout


class EscrowPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EscrowPayment
        fields = [
            'id', 'booking', 'amount', 'platform_fee', 'nanny_amount',
            'currency', 'status', 'stripe_payment_intent_id',
            'created_at', 'released_at', 'refunded_at',
        ]
        read_only_fields = fields


class SubscriptionSerializer(serializers.ModelSerializer):
    is_premium = serializers.BooleanField(read_only=True)

    class Meta:
        model = Subscription
        fields = [
            'id', 'user', 'plan', 'status',
            'stripe_subscription_id', 'stripe_customer_id',
            'current_period_start', 'current_period_end',
            'is_premium', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'user', 'status', 'stripe_subscription_id',
            'stripe_customer_id', 'current_period_start',
            'current_period_end', 'created_at', 'updated_at',
        ]


class PayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payout
        fields = [
            'id', 'nanny', 'amount', 'currency', 'status',
            'stripe_payout_id', 'escrow_payment',
            'created_at', 'paid_at',
        ]
        read_only_fields = fields


class CreateEscrowSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()

    def validate_booking_id(self, value):
        from apps.bookings.models import Booking
        try:
            Booking.objects.get(id=value)
        except Booking.DoesNotExist:
            raise serializers.ValidationError('Booking not found.')
        return value


class CreateSubscriptionSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(choices=Subscription.PLAN_CHOICES)
