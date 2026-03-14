from django.urls import path

from .views import FamilyProfileView, FavoriteListView, FavoriteToggleView

urlpatterns = [
    path('profile/', FamilyProfileView.as_view(), name='family-profile'),
    path('favorites/', FavoriteListView.as_view(), name='family-favorites'),
    path('favorites/toggle/', FavoriteToggleView.as_view(), name='family-favorite-toggle'),
]
