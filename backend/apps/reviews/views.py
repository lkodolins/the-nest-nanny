from django.db.models import Avg
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer, ReviewResponseSerializer
from apps.bookings.models import Booking


class ReviewCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        booking = Booking.objects.select_related('family__user', 'nanny').get(
            id=data['booking_id']
        )

        if booking.family.user != request.user:
            return Response(
                {'detail': 'Only the family can review a booking.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        review = Review.objects.create(
            booking=booking,
            reviewer=request.user,
            nanny=booking.nanny,
            rating=data['rating'],
            title=data['title'],
            content=data['content'],
        )

        # Update nanny rating stats
        nanny_profile = booking.nanny
        stats = nanny_profile.reviews.filter(is_published=True).aggregate(
            avg=Avg('rating')
        )
        nanny_profile.rating_average = stats['avg'] or 0
        nanny_profile.review_count = nanny_profile.reviews.filter(is_published=True).count()
        nanny_profile.save(update_fields=['rating_average', 'review_count'])

        return Response(
            ReviewSerializer(review).data,
            status=status.HTTP_201_CREATED,
        )


class MyReviewsView(generics.ListAPIView):
    """Reviews written by the current user (family)."""
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewSerializer

    def get_queryset(self):
        return Review.objects.filter(
            reviewer=self.request.user
        ).select_related('reviewer', 'nanny__user').order_by('-created_at')


class ReviewDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewSerializer
    queryset = Review.objects.select_related('reviewer', 'nanny__user')


class NannyReviewsView(generics.ListAPIView):
    """All reviews for a specific nanny (public)."""
    from rest_framework.permissions import AllowAny
    permission_classes = [AllowAny]
    serializer_class = ReviewSerializer

    def get_queryset(self):
        nanny_id = self.kwargs['nanny_id']
        return Review.objects.filter(
            nanny_id=nanny_id, is_published=True
        ).select_related('reviewer')


class ReviewResponseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'nanny':
            return Response(
                {'detail': 'Only nannies can respond to reviews.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            review = Review.objects.select_related('nanny__user').get(id=pk)
        except Review.DoesNotExist:
            return Response(
                {'detail': 'Review not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if review.nanny.user != request.user:
            return Response(
                {'detail': 'You can only respond to your own reviews.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if review.response:
            return Response(
                {'detail': 'You have already responded to this review.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ReviewResponseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review.response = serializer.validated_data['response']
        review.response_at = timezone.now()
        review.save()

        return Response(ReviewSerializer(review).data)
