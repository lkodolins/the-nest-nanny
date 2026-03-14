import uuid
import logging
from decimal import Decimal

import stripe
from django.conf import settings
from django.db.models import Sum, Q
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EscrowPayment, Subscription, Payout
from .serializers import (
    EscrowPaymentSerializer,
    SubscriptionSerializer,
    PayoutSerializer,
    CreateEscrowSerializer,
    CreateSubscriptionSerializer,
)
from apps.bookings.models import Booking

stripe.api_key = settings.STRIPE_SECRET_KEY
logger = logging.getLogger(__name__)


class CreateEscrowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateEscrowSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = Booking.objects.select_related('family__user', 'nanny').get(
            id=serializer.validated_data['booking_id']
        )

        if booking.family.user != request.user:
            return Response(
                {'detail': 'Only the booking family can create escrow.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if booking.status not in ('confirmed', 'in_progress'):
            return Response(
                {'detail': 'Booking must be confirmed to create escrow.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        amount = booking.total_amount or booking.hourly_rate
        platform_fee = amount * Decimal(settings.PLATFORM_FEE_PERCENTAGE) / Decimal(100)
        nanny_amount = amount - platform_fee

        # Mock Stripe PaymentIntent
        mock_pi_id = f'pi_mock_{uuid.uuid4().hex[:16]}'

        escrow = EscrowPayment.objects.create(
            booking=booking,
            amount=amount,
            platform_fee=platform_fee,
            nanny_amount=nanny_amount,
            currency=booking.currency,
            status='held',
            stripe_payment_intent_id=mock_pi_id,
        )

        return Response(
            EscrowPaymentSerializer(escrow).data,
            status=status.HTTP_201_CREATED,
        )


class ReleaseEscrowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, escrow_id):
        try:
            escrow = EscrowPayment.objects.select_related(
                'booking__family__user', 'booking__nanny'
            ).get(id=escrow_id)
        except EscrowPayment.DoesNotExist:
            return Response(
                {'detail': 'Escrow payment not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if escrow.status != 'held':
            return Response(
                {'detail': 'Escrow is not in held status.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Only family or admin can release
        user = request.user
        if user != escrow.booking.family.user and user.role != 'admin':
            return Response(
                {'detail': 'Only the family or admin can release escrow.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        now = timezone.now()
        escrow.status = 'released'
        escrow.released_at = now
        mock_transfer_id = f'tr_mock_{uuid.uuid4().hex[:16]}'
        escrow.stripe_transfer_id = mock_transfer_id
        escrow.save()

        # Create payout record for the nanny
        Payout.objects.create(
            nanny=escrow.booking.nanny,
            amount=escrow.nanny_amount,
            currency=escrow.currency,
            status='paid',
            stripe_payout_id=mock_transfer_id,
            escrow_payment=escrow,
            paid_at=now,
        )

        return Response(EscrowPaymentSerializer(escrow).data)


class PaymentHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = EscrowPaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'family':
            return EscrowPayment.objects.filter(
                booking__family__user=user
            ).order_by('-created_at')
        elif user.role == 'nanny':
            return EscrowPayment.objects.filter(
                booking__nanny__user=user
            ).order_by('-created_at')
        return EscrowPayment.objects.all().order_by('-created_at')


class SubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            subscription = Subscription.objects.get(user=request.user)
            return Response(SubscriptionSerializer(subscription).data)
        except Subscription.DoesNotExist:
            return Response(
                {'detail': 'No active subscription.'},
                status=status.HTTP_404_NOT_FOUND,
            )

    def post(self, request):
        serializer = CreateSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = serializer.validated_data['plan']

        # Free plan - just save locally, no Stripe needed
        if plan == 'family_basic':
            now = timezone.now()
            subscription, created = Subscription.objects.update_or_create(
                user=request.user,
                defaults={
                    'plan': plan,
                    'status': 'active',
                    'stripe_subscription_id': '',
                    'current_period_start': now,
                    'current_period_end': now + timezone.timedelta(days=36500),
                },
            )
            return Response(SubscriptionSerializer(subscription).data)

        # Paid plan — create Stripe Checkout Session
        PLAN_PRICES = {
            'family_premium': 1900,   # €19/mo in cents
            'family_elite': 3900,     # €39/mo in cents
            'nanny_standard': 900,    # €9/mo in cents
        }
        price_cents = PLAN_PRICES.get(plan)
        if not price_cents:
            return Response(
                {'detail': f'No pricing configured for plan: {plan}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        PLAN_LABELS = {
            'family_premium': 'Premium Plan',
            'family_elite': 'Family+ Plan',
            'nanny_standard': 'Nanny Standard Plan',
        }

        try:
            # Get or create Stripe customer
            sub = Subscription.objects.filter(user=request.user).first()
            customer_id = sub.stripe_customer_id if sub and sub.stripe_customer_id else None

            if not customer_id:
                customer = stripe.Customer.create(
                    email=request.user.email,
                    name=f'{request.user.first_name} {request.user.last_name}',
                    metadata={'user_id': str(request.user.id), 'plan': plan},
                )
                customer_id = customer.id

            # Create Checkout Session in subscription mode
            frontend_base = request.META.get('HTTP_ORIGIN', 'http://localhost:5173')
            session = stripe.checkout.Session.create(
                customer=customer_id,
                mode='subscription',
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'unit_amount': price_cents,
                        'recurring': {'interval': 'month'},
                        'product_data': {'name': PLAN_LABELS.get(plan, plan)},
                    },
                    'quantity': 1,
                }],
                success_url=f'{frontend_base}/family/subscription?success=true',
                cancel_url=f'{frontend_base}/family/subscription?cancelled=true',
                metadata={'user_id': str(request.user.id), 'plan': plan},
            )

            # Save pending subscription locally
            Subscription.objects.update_or_create(
                user=request.user,
                defaults={
                    'plan': plan,
                    'status': 'trialing',
                    'stripe_customer_id': customer_id,
                },
            )

            return Response({
                'checkout_url': session.url,
                'session_id': session.id,
            })

        except stripe.error.StripeError as e:
            logger.error(f'Stripe error creating checkout session: {e}')
            return Response(
                {'detail': f'Payment service error: {str(e)}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class CancelSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            subscription = Subscription.objects.get(user=request.user)
        except Subscription.DoesNotExist:
            return Response(
                {'detail': 'No active subscription.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        subscription.status = 'cancelled'
        subscription.save()
        return Response(SubscriptionSerializer(subscription).data)


class StripeConnectOnboardingView(APIView):
    """Create a Stripe Connect Express account for a nanny and return the onboarding link."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'nanny':
            return Response(
                {'detail': 'Only nannies can set up payout accounts.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        nanny_profile = request.user.nanny_profile
        frontend_base = request.META.get('HTTP_ORIGIN', 'http://localhost:5173')

        try:
            # Create or retrieve Connect account
            if nanny_profile.stripe_account_id:
                account_id = nanny_profile.stripe_account_id
            else:
                account = stripe.Account.create(
                    type='express',
                    country='LV',  # Default; adjust per nanny location
                    email=request.user.email,
                    capabilities={
                        'card_payments': {'requested': True},
                        'transfers': {'requested': True},
                    },
                    metadata={
                        'user_id': str(request.user.id),
                        'nanny_profile_id': str(nanny_profile.id),
                    },
                )
                account_id = account.id
                nanny_profile.stripe_account_id = account_id
                nanny_profile.save(update_fields=['stripe_account_id'])

            # Create an account link for onboarding
            account_link = stripe.AccountLink.create(
                account=account_id,
                refresh_url=f'{frontend_base}/nanny/earnings?connect=refresh',
                return_url=f'{frontend_base}/nanny/earnings?connect=success',
                type='account_onboarding',
            )

            return Response({
                'onboarding_url': account_link.url,
                'account_id': account_id,
            })

        except stripe.error.StripeError as e:
            logger.error(f'Stripe Connect error: {e}')
            return Response(
                {'detail': f'Payment service error: {str(e)}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class StripeConnectStatusView(APIView):
    """Check if the nanny's Stripe Connect account is fully onboarded."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'nanny':
            return Response(
                {'detail': 'Only nannies can check payout status.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        nanny_profile = request.user.nanny_profile
        if not nanny_profile.stripe_account_id:
            return Response({
                'connected': False,
                'details_submitted': False,
                'payouts_enabled': False,
            })

        try:
            account = stripe.Account.retrieve(nanny_profile.stripe_account_id)
            is_complete = account.get('details_submitted', False)

            if is_complete and not nanny_profile.stripe_onboarding_complete:
                nanny_profile.stripe_onboarding_complete = True
                nanny_profile.save(update_fields=['stripe_onboarding_complete'])

            return Response({
                'connected': True,
                'details_submitted': account.get('details_submitted', False),
                'payouts_enabled': account.get('payouts_enabled', False),
                'charges_enabled': account.get('charges_enabled', False),
            })
        except stripe.error.StripeError as e:
            return Response(
                {'detail': f'Could not check account status: {str(e)}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class NannyEarningsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'nanny':
            return Response(
                {'detail': 'Only nannies can view earnings.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        nanny_profile = request.user.nanny_profile
        payouts = Payout.objects.filter(nanny=nanny_profile)

        total_earned = payouts.filter(status='paid').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        pending = payouts.filter(status__in=('pending', 'processing')).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        return Response({
            'total_earned': str(total_earned),
            'pending_amount': str(pending),
            'currency': nanny_profile.currency,
            'total_bookings': nanny_profile.bookings.filter(status='completed').count(),
        })


class NannyPayoutsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PayoutSerializer

    def get_queryset(self):
        if self.request.user.role != 'nanny':
            return Payout.objects.none()
        return Payout.objects.filter(
            nanny=self.request.user.nanny_profile
        ).order_by('-created_at')


class StripeWebhookView(APIView):
    """Stripe webhook handler for subscription lifecycle events."""
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

        try:
            if settings.STRIPE_WEBHOOK_SECRET and settings.STRIPE_WEBHOOK_SECRET != 'whsec_placeholder':
                event = stripe.Webhook.construct_event(
                    payload, sig_header, settings.STRIPE_WEBHOOK_SECRET,
                )
            else:
                # Dev mode - parse without signature verification
                import json
                event = stripe.Event.construct_from(
                    json.loads(payload), stripe.api_key
                )
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            logger.warning(f'Stripe webhook signature failed: {e}')
            return Response({'detail': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

        event_type = event.get('type', '')
        data_obj = event.get('data', {}).get('object', {})

        if event_type == 'checkout.session.completed':
            self._handle_checkout_completed(data_obj)
        elif event_type == 'customer.subscription.updated':
            self._handle_subscription_updated(data_obj)
        elif event_type == 'customer.subscription.deleted':
            self._handle_subscription_deleted(data_obj)
        elif event_type == 'invoice.payment_succeeded':
            self._handle_invoice_paid(data_obj)

        return Response({'status': 'ok'})

    def _handle_checkout_completed(self, session):
        metadata = session.get('metadata', {})
        user_id = metadata.get('user_id')
        plan = metadata.get('plan')
        stripe_sub_id = session.get('subscription', '')
        stripe_cus_id = session.get('customer', '')

        if user_id and plan:
            from apps.accounts.models import User
            try:
                user = User.objects.get(id=user_id)
                now = timezone.now()
                Subscription.objects.update_or_create(
                    user=user,
                    defaults={
                        'plan': plan,
                        'status': 'active',
                        'stripe_subscription_id': stripe_sub_id or '',
                        'stripe_customer_id': stripe_cus_id or '',
                        'current_period_start': now,
                        'current_period_end': now + timezone.timedelta(days=30),
                    },
                )
            except Exception as e:
                logger.error(f'Error handling checkout.session.completed: {e}')

    def _handle_subscription_updated(self, sub_obj):
        stripe_sub_id = sub_obj.get('id', '')
        sub_status = sub_obj.get('status', '')
        try:
            subscription = Subscription.objects.get(stripe_subscription_id=stripe_sub_id)
            status_map = {
                'active': 'active', 'trialing': 'trialing',
                'past_due': 'past_due', 'canceled': 'cancelled',
                'unpaid': 'past_due',
            }
            subscription.status = status_map.get(sub_status, sub_status)
            period = sub_obj.get('current_period_end')
            if period:
                from datetime import datetime
                subscription.current_period_end = datetime.fromtimestamp(period, tz=timezone.utc)
            subscription.save()
        except Subscription.DoesNotExist:
            pass

    def _handle_subscription_deleted(self, sub_obj):
        stripe_sub_id = sub_obj.get('id', '')
        try:
            subscription = Subscription.objects.get(stripe_subscription_id=stripe_sub_id)
            subscription.status = 'cancelled'
            subscription.save()
        except Subscription.DoesNotExist:
            pass

    def _handle_invoice_paid(self, invoice):
        stripe_sub_id = invoice.get('subscription', '')
        if stripe_sub_id:
            try:
                subscription = Subscription.objects.get(stripe_subscription_id=stripe_sub_id)
                subscription.status = 'active'
                subscription.save()
            except Subscription.DoesNotExist:
                pass
