from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from apps.accounts.models import User


class ConversationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(
            Q(family=user) | Q(nanny=user)
        ).select_related('family', 'nanny').prefetch_related('messages')


class ConversationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        family_id = request.data.get('family_id')
        nanny_id = request.data.get('nanny_id')

        if not family_id or not nanny_id:
            return Response(
                {'detail': 'Both family_id and nanny_id are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            family_user = User.objects.get(id=family_id, role='family')
            nanny_user = User.objects.get(id=nanny_id, role='nanny')
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid family or nanny user.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        conversation, created = Conversation.objects.get_or_create(
            family=family_user, nanny=nanny_user
        )
        serializer = ConversationSerializer(
            conversation, context={'request': request}
        )
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class MessageListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        user = self.request.user

        # Verify user is a participant
        try:
            conversation = Conversation.objects.get(
                Q(id=conversation_id),
                Q(family=user) | Q(nanny=user),
            )
        except Conversation.DoesNotExist:
            return Message.objects.none()

        # Mark messages from the other party as read
        conversation.messages.filter(is_read=False).exclude(
            sender=user
        ).update(is_read=True, read_at=timezone.now())

        return conversation.messages.select_related('sender').all()


class MessageCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        user = self.request.user

        try:
            conversation = Conversation.objects.get(
                Q(id=conversation_id),
                Q(family=user) | Q(nanny=user),
            )
        except Conversation.DoesNotExist:
            return Response(
                {'detail': 'Conversation not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Rate limit for free-tier families
        if user.role == 'family':
            has_premium = hasattr(user, 'subscription') and user.subscription.is_premium
            if not has_premium:
                month_start = timezone.now().replace(
                    day=1, hour=0, minute=0, second=0, microsecond=0
                )
                sent_count = Message.objects.filter(
                    sender=user,
                    created_at__gte=month_start,
                ).count()
                if sent_count >= settings.FREE_TIER_MONTHLY_MESSAGES:
                    return Response(
                        {
                            'detail': 'Monthly message limit reached. '
                                      'Upgrade to premium for unlimited messaging.'
                        },
                        status=status.HTTP_429_TOO_MANY_REQUESTS,
                    )

        content = request.data.get('content', '').strip()
        if not content:
            return Response(
                {'detail': 'Message content is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = Message.objects.create(
            conversation=conversation,
            sender=user,
            content=content,
            message_type=request.data.get('message_type', 'text'),
        )
        conversation.last_message_at = message.created_at
        conversation.save(update_fields=['last_message_at'])

        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED,
        )
