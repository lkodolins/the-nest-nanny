from django.db import models
from django.conf import settings


class EscrowPayment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('held', 'Held in Escrow'),
        ('released', 'Released to Nanny'),
        ('refunded', 'Refunded to Family'),
        ('disputed', 'Disputed'),
    ]

    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='escrow_payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    nanny_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='EUR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)
    stripe_transfer_id = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    released_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f'Escrow #{self.pk}: {self.amount} {self.currency} ({self.status})'


class Subscription(models.Model):
    PLAN_CHOICES = [
        ('family_basic', 'Family Basic (Free)'),
        ('family_premium', 'Family Premium'),
        ('family_elite', 'Family+ (Elite)'),
        ('nanny_standard', 'Nanny Standard'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('past_due', 'Past Due'),
        ('trialing', 'Trialing'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscription'
    )
    plan = models.CharField(max_length=30, choices=PLAN_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    stripe_subscription_id = models.CharField(max_length=255, blank=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True)

    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'payments'

    def __str__(self):
        return f'{self.user} - {self.get_plan_display()} ({self.status})'

    @property
    def is_premium(self):
        return self.plan == 'family_premium' and self.status == 'active'


class Payout(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]

    nanny = models.ForeignKey(
        'nannies.NannyProfile',
        on_delete=models.CASCADE,
        related_name='payouts'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='EUR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    stripe_payout_id = models.CharField(max_length=255, blank=True)
    escrow_payment = models.ForeignKey(
        EscrowPayment,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='payouts'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'payments'
        ordering = ['-created_at']

    def __str__(self):
        return f'Payout #{self.pk}: {self.amount} {self.currency} to {self.nanny}'
