import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from apps.nannies.models import Language, Specialization, AgeGroup, NannyProfile
from apps.families.models import FamilyProfile
from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Seed reference data: languages, specializations, age groups, admin user, families, and nannies'

    def handle(self, *args, **options):
        # Languages
        languages = [
            ('English', 'en'), ('Spanish', 'es'), ('French', 'fr'),
            ('German', 'de'), ('Latvian', 'lv'), ('Polish', 'pl'),
            ('Arabic', 'ar'), ('Russian', 'ru'),
        ]
        for name, code in languages:
            Language.objects.get_or_create(name=name, defaults={'code': code})
        self.stdout.write(f'  Languages: {Language.objects.count()}')

        # Specializations
        specializations = [
            ('Newborn Care', 'newborn-care', 'Specialized care for infants 0-3 months'),
            ('Special Educational Needs', 'sen', 'Experience with SEN children'),
            ('Montessori', 'montessori', 'Montessori-trained approach'),
            ('Luxury & Travel', 'luxury-travel', 'Experience with HNWI families and travel'),
            ('Bilingual', 'bilingual', 'Bilingual childcare and language development'),
            ('Night Nanny', 'night-nanny', 'Overnight and sleep training specialist'),
        ]
        for name, slug, desc in specializations:
            Specialization.objects.get_or_create(name=name, defaults={'slug': slug, 'description': desc})
        self.stdout.write(f'  Specializations: {Specialization.objects.count()}')

        # Age Groups
        age_groups = [
            ('Newborn (0-1)', 0, 1),
            ('Toddler (1-3)', 1, 3),
            ('Preschool (3-5)', 3, 5),
            ('School Age (5-12)', 5, 12),
            ('Teenager (12-18)', 12, 18),
        ]
        for name, min_age, max_age in age_groups:
            AgeGroup.objects.get_or_create(name=name, defaults={'min_age': min_age, 'max_age': max_age})
        self.stdout.write(f'  Age Groups: {AgeGroup.objects.count()}')

        # Admin user
        if not User.objects.filter(email='admin@nestnanny.com').exists():
            User.objects.create_superuser(
                email='admin@nestnanny.com',
                password='admin123',
                first_name='Admin',
                last_name='User',
            )
            self.stdout.write('  Admin user created: admin@nestnanny.com / admin123')
        else:
            self.stdout.write('  Admin user already exists')

        # ── Family accounts ──────────────────────────────────────────────
        families_data = [
            {
                'email': 'family1@test.com',
                'first_name': 'Emma',
                'last_name': 'Johnson',
                'city': 'Riga',
            },
            {
                'email': 'family2@test.com',
                'first_name': 'Sarah',
                'last_name': 'Williams',
                'city': 'Marbella',
            },
            {
                'email': 'family3@test.com',
                'first_name': 'Anna',
                'last_name': 'Petersen',
                'city': 'Warsaw',
            },
        ]

        for fd in families_data:
            user, created = User.objects.get_or_create(
                email=fd['email'],
                defaults={
                    'first_name': fd['first_name'],
                    'last_name': fd['last_name'],
                    'role': 'family',
                    'is_email_verified': True,
                },
            )
            if created:
                user.set_password('Test1234!')
                user.save()

            FamilyProfile.objects.get_or_create(
                user=user,
                defaults={'city': fd['city']},
            )

        self.stdout.write(f'  Family accounts: {FamilyProfile.objects.count()}')

        # ── Nanny accounts ───────────────────────────────────────────────
        all_specs = list(Specialization.objects.all())

        nannies_data = [
            {
                'email': 'nanny1@test.com',
                'first_name': 'Maria',
                'last_name': 'Berzina',
                'city': 'Riga',
                'country': 'Latvia',
                'hourly_rate': Decimal('15.00'),
                'currency': 'EUR',
                'years_experience': 5,
                'bio': 'Experienced nanny with special education training. Loves outdoor activities and creative play.',
                'headline': 'Experienced & Caring Nanny',
                'languages': ['Latvian', 'English', 'Russian'],
                'rating_average': Decimal('4.80'),
                'review_count': 23,
            },
            {
                'email': 'nanny2@test.com',
                'first_name': 'Sofia',
                'last_name': 'Garcia',
                'city': 'Marbella',
                'country': 'Spain',
                'hourly_rate': Decimal('22.00'),
                'currency': 'EUR',
                'years_experience': 8,
                'bio': 'Bilingual nanny specializing in early childhood development. Former Montessori teacher.',
                'headline': 'Montessori-Trained Bilingual Nanny',
                'languages': ['English', 'Spanish'],
                'rating_average': Decimal('4.95'),
                'review_count': 41,
            },
            {
                'email': 'nanny3@test.com',
                'first_name': 'Katarzyna',
                'last_name': 'Nowak',
                'city': 'Warsaw',
                'country': 'Poland',
                'hourly_rate': Decimal('12.00'),
                'currency': 'EUR',
                'years_experience': 3,
                'bio': 'Creative and energetic nanny who loves arts and crafts. CPR and First Aid certified.',
                'headline': 'Creative & Energetic Childcare',
                'languages': ['Polish', 'English'],
                'rating_average': Decimal('4.50'),
                'review_count': 12,
            },
            {
                'email': 'nanny4@test.com',
                'first_name': 'Fatima',
                'last_name': 'Al-Rashid',
                'city': 'Doha',
                'country': 'Qatar',
                'hourly_rate': Decimal('30.00'),
                'currency': 'QAR',
                'years_experience': 10,
                'bio': 'Premium nanny with luxury household experience. Fluent in Arabic and English, specialized in high-net-worth families.',
                'headline': 'Premium Luxury Nanny',
                'languages': ['Arabic', 'English', 'French'],
                'rating_average': Decimal('4.90'),
                'review_count': 37,
            },
            {
                'email': 'nanny5@test.com',
                'first_name': 'Jessica',
                'last_name': 'Miller',
                'city': 'Los Angeles',
                'country': 'USA',
                'hourly_rate': Decimal('28.00'),
                'currency': 'USD',
                'years_experience': 6,
                'bio': 'Fun-loving nanny with a background in child psychology. Expert in special needs care.',
                'headline': 'Child Psychology Expert',
                'languages': ['English', 'Spanish'],
                'rating_average': Decimal('4.70'),
                'review_count': 29,
            },
        ]

        for nd in nannies_data:
            user, created = User.objects.get_or_create(
                email=nd['email'],
                defaults={
                    'first_name': nd['first_name'],
                    'last_name': nd['last_name'],
                    'role': 'nanny',
                    'is_email_verified': True,
                },
            )
            if created:
                user.set_password('Test1234!')
                user.save()

            profile, _ = NannyProfile.objects.get_or_create(
                user=user,
                defaults={
                    'bio': nd['bio'],
                    'headline': nd['headline'],
                    'years_experience': nd['years_experience'],
                    'city': nd['city'],
                    'country': nd['country'],
                    'hourly_rate': nd['hourly_rate'],
                    'currency': nd['currency'],
                    'is_available': True,
                    'is_profile_complete': True,
                    'rating_average': nd['rating_average'],
                    'review_count': nd['review_count'],
                },
            )

            # Set languages
            lang_objs = Language.objects.filter(name__in=nd['languages'])
            profile.languages.set(lang_objs)

            # Set 2-3 random specializations
            num_specs = random.randint(2, min(3, len(all_specs)))
            profile.specializations.set(random.sample(all_specs, num_specs))

        self.stdout.write(f'  Nanny accounts: {NannyProfile.objects.count()}')

        self.stdout.write(self.style.SUCCESS('Seed data loaded successfully'))
