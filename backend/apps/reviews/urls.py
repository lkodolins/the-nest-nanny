from django.urls import path

from .views import (
    ReviewCreateView,
    ReviewDetailView,
    MyReviewsView,
    NannyReviewsView,
    ReviewResponseView,
)

urlpatterns = [
    path('create/', ReviewCreateView.as_view(), name='review-create'),
    path('my/', MyReviewsView.as_view(), name='my-reviews'),
    path('<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
    path('<int:pk>/respond/', ReviewResponseView.as_view(), name='review-respond'),
    path('nanny/<int:nanny_id>/', NannyReviewsView.as_view(), name='nanny-reviews'),
]
