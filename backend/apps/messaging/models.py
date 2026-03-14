from django.db import models
from django.conf import settings


class Conversation(models.Model):
    family = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='family_conversations'
    )
    nanny = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='nanny_conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    is_archived_by_family = models.BooleanField(default=False)
    is_archived_by_nanny = models.BooleanField(default=False)

    class Meta:
        app_label = 'messaging'
        unique_together = ('family', 'nanny')
        ordering = ['-last_message_at']

    def __str__(self):
        return f'Conversation: {self.family} ↔ {self.nanny}'


class Message(models.Model):
    TYPE_CHOICES = [
        ('text', 'Text'),
        ('system', 'System'),
        ('booking_request', 'Booking Request'),
        ('image', 'Image'),
    ]

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content = models.TextField()
    message_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='text')
    attachment = models.FileField(upload_to='message_attachments/', blank=True, null=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'messaging'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender} → {self.conversation} ({self.created_at})'
