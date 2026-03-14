from django.db import models
from django.conf import settings


class Language(models.Model):
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=10, unique=True)

    class Meta:
        app_label = 'nannies'
        ordering = ['name']

    def __str__(self):
        return self.name


class Specialization(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        app_label = 'nannies'
        ordering = ['name']

    def __str__(self):
        return self.name


class AgeGroup(models.Model):
    name = models.CharField(max_length=50, unique=True)
    min_age = models.PositiveIntegerField()
    max_age = models.PositiveIntegerField()

    class Meta:
        app_label = 'nannies'
        ordering = ['min_age']

    def __str__(self):
        return self.name


class NannyProfile(models.Model):
    CITY_CHOICES = settings.SUPPORTED_CITIES
    CURRENCY_CHOICES = [
        ('EUR', 'Euro'),
        ('USD', 'US Dollar'),
        ('QAR', 'Qatari Riyal'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='nanny_profile'
    )
    bio = models.TextField(blank=True)
    headline = models.CharField(max_length=200, blank=True)
    years_experience = models.PositiveIntegerField(default=0)
    date_of_birth = models.DateField(null=True, blank=True)

    # Location
    city = models.CharField(max_length=50, choices=CITY_CHOICES)
    country = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=255, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Rate
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='EUR')

    # Relations
    languages = models.ManyToManyField(Language, blank=True, related_name='nannies')
    specializations = models.ManyToManyField(Specialization, blank=True, related_name='nannies')
    age_groups = models.ManyToManyField(AgeGroup, blank=True, related_name='nannies')

    # Status
    is_verified = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    is_profile_complete = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)

    # Stripe Connect
    stripe_account_id = models.CharField(max_length=255, blank=True)
    stripe_onboarding_complete = models.BooleanField(default=False)

    # Denormalized stats
    rating_average = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'nannies'

    def __str__(self):
        return f'{self.user.full_name} - {self.city}'


class NannyAvailability(models.Model):
    DAY_CHOICES = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
        (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday'),
    ]

    nanny = models.ForeignKey(
        NannyProfile, on_delete=models.CASCADE, related_name='availability_slots'
    )
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_recurring = models.BooleanField(default=True)
    specific_date = models.DateField(null=True, blank=True)

    class Meta:
        app_label = 'nannies'
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f'{self.nanny} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}'


class Certification(models.Model):
    TYPE_CHOICES = [
        ('first_aid', 'First Aid'),
        ('cpr', 'CPR'),
        ('montessori', 'Montessori'),
        ('sen', 'Special Educational Needs'),
        ('childcare', 'Childcare Qualification'),
        ('early_years', 'Early Years'),
        ('other', 'Other'),
    ]

    nanny = models.ForeignKey(
        NannyProfile, on_delete=models.CASCADE, related_name='certifications'
    )
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    name = models.CharField(max_length=200)
    issuing_body = models.CharField(max_length=200)
    certificate_number = models.CharField(max_length=100, blank=True)
    valid_from = models.DateField()
    valid_until = models.DateField(null=True, blank=True)
    document = models.FileField(upload_to='certifications/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'nannies'

    def __str__(self):
        return f'{self.nanny} - {self.name}'

    @property
    def is_valid(self):
        if self.valid_until is None:
            return True
        from django.utils import timezone
        return self.valid_until >= timezone.now().date()


class TimeOff(models.Model):
    nanny = models.ForeignKey(
        NannyProfile, on_delete=models.CASCADE, related_name='time_off'
    )
    date = models.DateField()
    reason = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'nannies'
        ordering = ['date']
        unique_together = ('nanny', 'date')

    def __str__(self):
        return f'{self.nanny} - {self.date}'


class NannyPhoto(models.Model):
    nanny = models.ForeignKey(
        NannyProfile, on_delete=models.CASCADE, related_name='photos'
    )
    image = models.ImageField(upload_to='nanny_photos/')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'nannies'
        ordering = ['order']
