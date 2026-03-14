from django.db import models
from django.conf import settings


class FamilyProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='family_profile'
    )
    bio = models.TextField(blank=True)
    city = models.CharField(max_length=50, choices=settings.SUPPORTED_CITIES, blank=True)
    country = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    children = models.JSONField(
        default=list,
        blank=True,
        help_text='List of children: [{name, age, special_needs}]'
    )
    preferred_languages = models.ManyToManyField(
        'nannies.Language', blank=True, related_name='preferred_by_families'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'families'

    def __str__(self):
        return f'{self.user.full_name} Family'


class Favorite(models.Model):
    family = models.ForeignKey(
        FamilyProfile, on_delete=models.CASCADE, related_name='favorites'
    )
    nanny = models.ForeignKey(
        'nannies.NannyProfile', on_delete=models.CASCADE, related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'families'
        unique_together = ('family', 'nanny')

    def __str__(self):
        return f'{self.family} → {self.nanny}'
