from rest_framework import serializers

from .models import Review
from apps.accounts.serializers import UserSerializer


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'booking', 'reviewer', 'nanny', 'rating',
            'title', 'content', 'is_published',
            'response', 'response_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'booking', 'reviewer', 'nanny', 'is_published',
            'response', 'response_at', 'created_at', 'updated_at',
        ]


class ReviewCreateSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    title = serializers.CharField(max_length=200)
    content = serializers.CharField()

    def validate_booking_id(self, value):
        from apps.bookings.models import Booking
        try:
            booking = Booking.objects.get(id=value)
        except Booking.DoesNotExist:
            raise serializers.ValidationError('Booking not found.')
        if booking.status != 'completed':
            raise serializers.ValidationError('Can only review completed bookings.')
        if hasattr(booking, 'review'):
            raise serializers.ValidationError('This booking already has a review.')
        return value


class ReviewResponseSerializer(serializers.Serializer):
    response = serializers.CharField()
