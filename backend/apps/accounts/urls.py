from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterFamilyView,
    RegisterNannyView,
    LoginView,
    LogoutView,
    UserProfileView,
    ChangePasswordView,
    GoogleLoginView,
)

urlpatterns = [
    path('register/family/', RegisterFamilyView.as_view(), name='register-family'),
    path('register/nanny/', RegisterNannyView.as_view(), name='register-nanny'),
    path('login/', LoginView.as_view(), name='login'),
    path('login/google/', GoogleLoginView.as_view(), name='google-login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]
