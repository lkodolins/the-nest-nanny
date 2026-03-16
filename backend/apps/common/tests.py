from django.conf import settings
from django.test import TestCase, override_settings


MIDDLEWARE_NO_WHITENOISE = [
    middleware
    for middleware in settings.MIDDLEWARE
    if middleware != "whitenoise.middleware.WhiteNoiseMiddleware"
]


@override_settings(MIDDLEWARE=MIDDLEWARE_NO_WHITENOISE)
class HealthEndpointTests(TestCase):
    def test_root_health_endpoint_returns_200(self):
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})
