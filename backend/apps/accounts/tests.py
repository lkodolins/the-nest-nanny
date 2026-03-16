from django.conf import settings
from django.test import TestCase, override_settings

from .models import User


MIDDLEWARE_NO_WHITENOISE = [
    middleware
    for middleware in settings.MIDDLEWARE
    if middleware != "whitenoise.middleware.WhiteNoiseMiddleware"
]


@override_settings(MIDDLEWARE=MIDDLEWARE_NO_WHITENOISE)
class RegisterCompatEndpointTests(TestCase):
    def test_register_endpoint_creates_family_user(self):
        payload = {
            "email": "family@example.com",
            "password": "StrongPass123!",
            "first_name": "Test",
            "last_name": "Family",
            "user_type": "family",
        }

        response = self.client.post("/api/auth/register/", data=payload)

        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email="family@example.com", role="family").exists())
