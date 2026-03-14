from rest_framework import serializers

from .models import Conversation, Message
from apps.accounts.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'content', 'message_type',
            'is_read', 'created_at',
        ]
        read_only_fields = ['conversation', 'sender', 'is_read', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    family = UserSerializer(read_only=True)
    nanny = UserSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'family', 'nanny', 'last_message_at',
            'last_message', 'unread_count', 'created_at',
        ]

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return {
                'content': msg.content[:100],
                'sender_id': msg.sender_id,
                'created_at': msg.created_at.isoformat(),
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.messages.filter(is_read=False).exclude(
                sender=request.user
            ).count()
        return 0
