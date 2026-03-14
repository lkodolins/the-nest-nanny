from django.urls import path

from .views import (
    NotificationListView,
    MarkNotificationReadView,
    AdminAnalyticsView,
)

urlpatterns = [
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/read/', MarkNotificationReadView.as_view(), name='notifications-read-all'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification-read'),
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
]
