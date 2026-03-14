from django.urls import path

from .views import (
    VerificationStatusView,
    StartIdentityVerificationView,
    StartVerificationStepView,
    SubmitReferenceView,
    AdminVerificationQueueView,
    AdminVerificationUpdateView,
)

urlpatterns = [
    path('status/', VerificationStatusView.as_view(), name='verification-status'),
    path('identity/start/', StartIdentityVerificationView.as_view(), name='verification-identity-start'),
    path('<str:step>/start/', StartVerificationStepView.as_view(), name='verification-step-start'),
    path('references/submit/', SubmitReferenceView.as_view(), name='verification-reference-submit'),
    path('admin/queue/', AdminVerificationQueueView.as_view(), name='verification-admin-queue'),
    path('admin/<int:pk>/update/', AdminVerificationUpdateView.as_view(), name='verification-admin-update'),
]
