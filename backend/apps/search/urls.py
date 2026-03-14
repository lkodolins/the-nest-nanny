from django.urls import path, include

# Search functionality is handled by the nannies app search endpoint.
# This module redirects to nannies search for convenience.
urlpatterns = [
    path('nannies/', include('apps.nannies.urls')),
]
