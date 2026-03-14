import logging

from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    UserSerializer,
    RegisterFamilySerializer,
    RegisterNannySerializer,
    LoginSerializer,
    ChangePasswordSerializer,
)

logger = logging.getLogger(__name__)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterFamilyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterFamilySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
        }, status=status.HTTP_201_CREATED)


class RegisterNannyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterNannySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'detail': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Successfully logged out.'})
        except Exception:
            return Response(
                {'detail': 'Invalid refresh token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        allowed_fields = ['first_name', 'last_name', 'phone', 'avatar']
        for field, value in request.data.items():
            if field in allowed_fields:
                setattr(user, field, value)
        user.save()
        return Response(UserSerializer(user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password updated successfully.'})


class GoogleLoginView(APIView):
    """
    Accepts a Google ID token (credential) + desired role.
    Verifies the token, creates or logs in the user, returns JWT tokens.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        credential = request.data.get('credential')
        role = request.data.get('role', 'family')

        if not credential:
            return Response(
                {'detail': 'Google credential is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify the Google ID token
        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests

            client_id = settings.GOOGLE_OAUTH_CLIENT_ID
            if not client_id:
                return Response(
                    {'detail': 'Google OAuth is not configured on this server.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                client_id,
            )

            email = idinfo.get('email')
            if not email or not idinfo.get('email_verified'):
                return Response(
                    {'detail': 'Google account email not verified.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            avatar_url = idinfo.get('picture', '')

        except ValueError as e:
            logger.warning('Google token verification failed: %s', e)
            return Response(
                {'detail': 'Invalid Google token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception as e:
            logger.error('Google OAuth error: %s', e)
            return Response(
                {'detail': 'Google authentication failed.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Find or create user
        try:
            user = User.objects.get(email=email)
            # Existing user — just log them in
        except User.DoesNotExist:
            # Create new user with Google info
            if role not in ('family', 'nanny'):
                role = 'family'

            user = User.objects.create_user(
                email=email,
                password=None,  # No password for Google users
                first_name=first_name,
                last_name=last_name,
                role=role,
                is_email_verified=True,
            )

            # Create the appropriate profile
            if role == 'family':
                from apps.families.models import FamilyProfile
                FamilyProfile.objects.get_or_create(user=user, defaults={
                    'city': '', 'country': '',
                })
            elif role == 'nanny':
                from apps.nannies.models import NannyProfile
                NannyProfile.objects.get_or_create(user=user, defaults={
                    'city': '', 'country': '', 'hourly_rate': 0, 'currency': 'EUR',
                })

        tokens = get_tokens_for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
        })
