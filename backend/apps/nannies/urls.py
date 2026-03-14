from django.urls import path

from .views import (
    NannySearchView,
    FeaturedNanniesView,
    NannyProfileDetailView,
    NannyOwnProfileView,
    NannyAvailabilityView,
    NannyCertificationView,
    NannyPhotoView,
    TimeOffView,
)

urlpatterns = [
    path('search/', NannySearchView.as_view(), name='nanny-search'),
    path('featured/', FeaturedNanniesView.as_view(), name='nanny-featured'),
    path('me/', NannyOwnProfileView.as_view(), name='nanny-own-profile'),
    path('me/availability/', NannyAvailabilityView.as_view(), name='nanny-availability'),
    path('me/certifications/', NannyCertificationView.as_view(), name='nanny-certifications'),
    path('me/photos/', NannyPhotoView.as_view(), name='nanny-photos'),
    path('me/time-off/', TimeOffView.as_view(), name='nanny-time-off'),
    path('me/time-off/<int:pk>/', TimeOffView.as_view(), name='nanny-time-off-detail'),
    path('<int:pk>/', NannyProfileDetailView.as_view(), name='nanny-detail'),
]
