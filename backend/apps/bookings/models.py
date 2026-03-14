from django.db import models
from django.conf import settings


class Booking(models.Model):
    TYPE_CHOICES = [
        ('one_off', 'One-Off'),
        ('regular', 'Regular Placement'),
        ('live_in', 'Live-In'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('disputed', 'Disputed'),
    ]

    family = models.ForeignKey(
        'families.FamilyProfile',
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    nanny = models.ForeignKey(
        'nannies.NannyProfile',
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    booking_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    hours_per_week = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)

    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='EUR')

    notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='cancelled_bookings'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'bookings'
        ordering = ['-created_at']

    def __str__(self):
        return f'Booking #{self.pk}: {self.family} → {self.nanny} ({self.status})'


class Contract(models.Model):
    booking = models.OneToOneField(
        Booking, on_delete=models.CASCADE, related_name='contract'
    )
    terms = models.TextField()
    special_conditions = models.TextField(blank=True)

    family_signed = models.BooleanField(default=False)
    family_signed_at = models.DateTimeField(null=True, blank=True)
    family_signature = models.TextField(blank=True)

    nanny_signed = models.BooleanField(default=False)
    nanny_signed_at = models.DateTimeField(null=True, blank=True)
    nanny_signature = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'bookings'

    def __str__(self):
        return f'Contract for Booking #{self.booking.pk}'

    @property
    def is_fully_signed(self):
        return self.family_signed and self.nanny_signed
