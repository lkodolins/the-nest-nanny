from django.db import models
from django.conf import settings


class VerificationRecord(models.Model):
    STEP_CHOICES = [
        ('identity', 'Identity Verification'),
        ('background_check', 'Criminal Background Check'),
        ('references', 'Reference Screening'),
        ('certifications', 'Certifications & Training'),
    ]
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]

    nanny = models.ForeignKey(
        'nannies.NannyProfile',
        on_delete=models.CASCADE,
        related_name='verification_records'
    )
    step = models.CharField(max_length=30, choices=STEP_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    provider_reference = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reviewed_verifications'
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'verification'
        unique_together = ('nanny', 'step')

    def __str__(self):
        return f'{self.nanny} - {self.get_step_display()} ({self.get_status_display()})'


class Reference(models.Model):
    nanny = models.ForeignKey(
        'nannies.NannyProfile',
        on_delete=models.CASCADE,
        related_name='references'
    )
    referee_name = models.CharField(max_length=200)
    referee_email = models.EmailField()
    referee_phone = models.CharField(max_length=20, blank=True)
    relationship = models.CharField(max_length=100)
    employer_name = models.CharField(max_length=200, blank=True)
    years_known = models.PositiveIntegerField(default=0)
    reference_text = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='verified_references'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'verification'

    def __str__(self):
        return f'{self.referee_name} for {self.nanny}'
