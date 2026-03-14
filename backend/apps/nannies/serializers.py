from rest_framework import serializers

from .models import (
    Language, Specialization, AgeGroup,
    NannyProfile, NannyAvailability, Certification, NannyPhoto, TimeOff,
)
from apps.accounts.serializers import UserSerializer


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'name', 'code']


class SpecializationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialization
        fields = ['id', 'name', 'slug', 'description']


class AgeGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgeGroup
        fields = ['id', 'name', 'min_age', 'max_age']


class CertificationSerializer(serializers.ModelSerializer):
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Certification
        fields = [
            'id', 'type', 'name', 'issuing_body', 'certificate_number',
            'valid_from', 'valid_until', 'document', 'is_verified',
            'verified_at', 'is_valid',
        ]
        read_only_fields = ['is_verified', 'verified_at']


class NannyAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = NannyAvailability
        fields = [
            'id', 'day_of_week', 'start_time', 'end_time',
            'is_recurring', 'specific_date',
        ]


class TimeOffSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeOff
        fields = ['id', 'date', 'reason', 'created_at']
        read_only_fields = ['created_at']


class NannyPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = NannyPhoto
        fields = ['id', 'image', 'is_primary', 'order', 'created_at']
        read_only_fields = ['created_at']


class NannyCardSerializer(serializers.ModelSerializer):
    """Lightweight serializer for search results and listings."""
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    specializations = SpecializationSerializer(many=True, read_only=True)

    class Meta:
        model = NannyProfile
        fields = [
            'id', 'first_name', 'last_name', 'avatar', 'headline', 'bio',
            'city', 'hourly_rate', 'currency',
            'languages', 'specializations', 'rating_average', 'review_count',
            'is_verified', 'is_available', 'years_experience',
        ]


class NannyProfileSerializer(serializers.ModelSerializer):
    """Full detail serializer for nanny profile page."""
    user = UserSerializer(read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    specializations = SpecializationSerializer(many=True, read_only=True)
    age_groups = AgeGroupSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    availability_slots = NannyAvailabilitySerializer(many=True, read_only=True)
    photos = NannyPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = NannyProfile
        fields = [
            'id', 'user', 'bio', 'headline', 'years_experience',
            'city', 'country', 'hourly_rate', 'currency',
            'languages', 'specializations', 'age_groups',
            'certifications', 'availability_slots', 'photos',
            'rating_average', 'review_count', 'is_verified',
            'is_featured', 'is_available', 'is_profile_complete',
            'created_at', 'updated_at',
        ]


class NannyProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for nanny editing their own profile."""
    language_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Language.objects.all(),
        write_only=True, required=False, source='languages',
    )
    specialization_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Specialization.objects.all(),
        write_only=True, required=False, source='specializations',
    )
    age_group_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=AgeGroup.objects.all(),
        write_only=True, required=False, source='age_groups',
    )

    class Meta:
        model = NannyProfile
        fields = [
            'bio', 'headline', 'years_experience', 'city', 'country',
            'address', 'hourly_rate', 'currency', 'is_available',
            'language_ids', 'specialization_ids', 'age_group_ids',
        ]

    def update(self, instance, validated_data):
        languages = validated_data.pop('languages', None)
        specializations = validated_data.pop('specializations', None)
        age_groups = validated_data.pop('age_groups', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if languages is not None:
            instance.languages.set(languages)
        if specializations is not None:
            instance.specializations.set(specializations)
        if age_groups is not None:
            instance.age_groups.set(age_groups)

        return instance
