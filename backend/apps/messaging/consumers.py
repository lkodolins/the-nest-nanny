import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.db.models import Q


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        user = self.scope.get('user')
        if user is None or user.is_anonymous:
            await self.close()
            return

        # Verify user is a participant in this conversation
        is_participant = await self.check_participant(user, self.conversation_id)
        if not is_participant:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive_json(self, content):
        message_type = content.get('type', 'chat_message')

        if message_type == 'chat_message':
            user = self.scope['user']
            message_data = await self.save_message(
                user, self.conversation_id, content.get('message', '')
            )
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message_data,
                },
            )
        elif message_type == 'typing':
            user = self.scope['user']
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user_id': user.id,
                    'is_typing': content.get('is_typing', False),
                },
            )

    async def chat_message(self, event):
        await self.send_json({
            'type': 'chat_message',
            'message': event['message'],
        })

    async def typing_indicator(self, event):
        await self.send_json({
            'type': 'typing',
            'user_id': event['user_id'],
            'is_typing': event['is_typing'],
        })

    @database_sync_to_async
    def check_participant(self, user, conversation_id):
        from .models import Conversation
        return Conversation.objects.filter(
            Q(id=conversation_id),
            Q(family=user) | Q(nanny=user),
        ).exists()

    @database_sync_to_async
    def save_message(self, user, conversation_id, content):
        from .models import Conversation, Message
        from django.utils import timezone

        conversation = Conversation.objects.get(id=conversation_id)
        message = Message.objects.create(
            conversation=conversation,
            sender=user,
            content=content,
            message_type='text',
        )
        conversation.last_message_at = message.created_at
        conversation.save(update_fields=['last_message_at'])

        return {
            'id': message.id,
            'sender_id': user.id,
            'sender_name': user.first_name,
            'content': message.content,
            'created_at': message.created_at.isoformat(),
        }
