from django.urls import path

from .views import (
    CreateEscrowView,
    ReleaseEscrowView,
    PaymentHistoryView,
    SubscriptionView,
    CancelSubscriptionView,
    NannyEarningsView,
    NannyPayoutsView,
    StripeWebhookView,
    StripeConnectOnboardingView,
    StripeConnectStatusView,
)

urlpatterns = [
    path('escrow/create/', CreateEscrowView.as_view(), name='escrow-create'),
    path('escrow/<int:escrow_id>/release/', ReleaseEscrowView.as_view(), name='escrow-release'),
    path('history/', PaymentHistoryView.as_view(), name='payment-history'),
    path('subscription/', SubscriptionView.as_view(), name='subscription'),
    path('subscription/cancel/', CancelSubscriptionView.as_view(), name='subscription-cancel'),
    path('earnings/', NannyEarningsView.as_view(), name='nanny-earnings'),
    path('payouts/', NannyPayoutsView.as_view(), name='nanny-payouts'),
    path('connect/onboard/', StripeConnectOnboardingView.as_view(), name='stripe-connect-onboard'),
    path('connect/status/', StripeConnectStatusView.as_view(), name='stripe-connect-status'),
    path('webhook/stripe/', StripeWebhookView.as_view(), name='stripe-webhook'),
]
