from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'type', 'type_display', 'title', 'message',
            'link', 'is_read', 'read_at', 'created_at',
        ]
        read_only_fields = [
            'user', 'type', 'title', 'message', 'link', 'created_at',
        ]
