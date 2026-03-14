from decimal import Decimal

from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        now = timezone.now()

        if pk:
            # Mark single notification as read
            try:
                notification = Notification.objects.get(
                    id=pk, user=request.user
                )
            except Notification.DoesNotExist:
                return Response(
                    {'detail': 'Notification not found.'},
                    status=status.HTTP_404_NOT_FOUND,
                )
            notification.is_read = True
            notification.read_at = now
            notification.save()
            return Response(NotificationSerializer(notification).data)
        else:
            # Mark all as read
            Notification.objects.filter(
                user=request.user, is_read=False
            ).update(is_read=True, read_at=now)
            return Response({'detail': 'All notifications marked as read.'})


class AdminAnalyticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from apps.accounts.models import User
        from apps.bookings.models import Booking
        from apps.payments.models import EscrowPayment

        total_users = User.objects.count()
        total_nannies = User.objects.filter(role='nanny').count()
        total_families = User.objects.filter(role='family').count()
        total_bookings = Booking.objects.count()
        active_bookings = Booking.objects.filter(
            status__in=('confirmed', 'in_progress')
        ).count()
        completed_bookings = Booking.objects.filter(status='completed').count()

        total_revenue = EscrowPayment.objects.filter(
            status='released'
        ).aggregate(
            total=Sum('platform_fee')
        )['total'] or Decimal('0.00')

        total_gmv = EscrowPayment.objects.filter(
            status='released'
        ).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        return Response({
            'total_users': total_users,
            'total_nannies': total_nannies,
            'total_families': total_families,
            'total_bookings': total_bookings,
            'active_bookings': active_bookings,
            'completed_bookings': completed_bookings,
            'total_revenue': str(total_revenue),
            'total_gmv': str(total_gmv),
        })
