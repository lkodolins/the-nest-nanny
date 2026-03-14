from rest_framework import serializers

from .models import FamilyProfile, Favorite
from apps.nannies.serializers import NannyCardSerializer, LanguageSerializer


class FamilyProfileSerializer(serializers.ModelSerializer):
    preferred_languages = LanguageSerializer(many=True, read_only=True)
    preferred_language_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=__import__('apps.nannies.models', fromlist=['Language']).Language.objects.all(),
        write_only=True,
        required=False,
        source='preferred_languages',
    )

    class Meta:
        model = FamilyProfile
        fields = [
            'id', 'bio', 'city', 'country', 'address',
            'latitude', 'longitude', 'children',
            'preferred_languages', 'preferred_language_ids',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def update(self, instance, validated_data):
        preferred_languages = validated_data.pop('preferred_languages', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if preferred_languages is not None:
            instance.preferred_languages.set(preferred_languages)
        return instance


class FavoriteSerializer(serializers.ModelSerializer):
    nanny_profile = NannyCardSerializer(source='nanny', read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'nanny', 'nanny_profile', 'created_at']
        read_only_fields = ['created_at']
