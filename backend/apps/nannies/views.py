from rest_framework import generics, status, filters
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import NannyProfile, NannyAvailability, Certification, NannyPhoto, TimeOff
from .serializers import (
    NannyCardSerializer,
    NannyProfileSerializer,
    NannyProfileUpdateSerializer,
    NannyAvailabilitySerializer,
    CertificationSerializer,
    NannyPhotoSerializer,
    TimeOffSerializer,
)


class IsNanny(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'nanny'


class NannySearchView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = NannyCardSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'city': ['exact'],
        'is_verified': ['exact'],
        'hourly_rate': ['gte', 'lte'],
    }
    search_fields = ['user__first_name', 'user__last_name', 'headline', 'bio']
    ordering_fields = ['hourly_rate', 'rating_average', 'review_count', 'years_experience']

    def get_queryset(self):
        qs = NannyProfile.objects.select_related('user').prefetch_related(
            'languages', 'specializations'
        ).filter(is_available=True)

        languages = self.request.query_params.getlist('languages')
        if languages:
            qs = qs.filter(languages__id__in=languages).distinct()

        specializations = self.request.query_params.getlist('specializations')
        if specializations:
            qs = qs.filter(specializations__id__in=specializations).distinct()

        return qs


class FeaturedNanniesView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = NannyCardSerializer
    pagination_class = None

    def get_queryset(self):
        return NannyProfile.objects.select_related('user').prefetch_related(
            'languages', 'specializations'
        ).filter(is_featured=True, is_available=True)[:12]


class NannyProfileDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = NannyProfileSerializer
    queryset = NannyProfile.objects.select_related('user').prefetch_related(
        'languages', 'specializations', 'age_groups',
        'certifications', 'availability_slots', 'photos',
    )


class NannyOwnProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsNanny]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return NannyProfileUpdateSerializer
        return NannyProfileSerializer

    def get_object(self):
        return NannyProfile.objects.select_related('user').prefetch_related(
            'languages', 'specializations', 'age_groups',
            'certifications', 'availability_slots', 'photos',
        ).get(user=self.request.user)


class NannyAvailabilityView(APIView):
    permission_classes = [IsNanny]

    def get(self, request):
        profile = request.user.nanny_profile
        slots = profile.availability_slots.all()
        serializer = NannyAvailabilitySerializer(slots, many=True)
        return Response(serializer.data)

    def put(self, request):
        profile = request.user.nanny_profile
        # Replace all availability slots
        profile.availability_slots.all().delete()
        serializer = NannyAvailabilitySerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        for slot_data in serializer.validated_data:
            NannyAvailability.objects.create(nanny=profile, **slot_data)
        slots = profile.availability_slots.all()
        return Response(NannyAvailabilitySerializer(slots, many=True).data)


class NannyCertificationView(APIView):
    permission_classes = [IsNanny]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        profile = request.user.nanny_profile
        certs = profile.certifications.all()
        return Response(CertificationSerializer(certs, many=True).data)

    def post(self, request):
        profile = request.user.nanny_profile
        serializer = CertificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(nanny=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class NannyPhotoView(APIView):
    permission_classes = [IsNanny]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        profile = request.user.nanny_profile
        photos = profile.photos.all()
        return Response(NannyPhotoSerializer(photos, many=True).data)

    def post(self, request):
        profile = request.user.nanny_profile
        serializer = NannyPhotoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(nanny=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        profile = request.user.nanny_profile
        photo_id = request.data.get('photo_id')
        if not photo_id:
            return Response(
                {'detail': 'photo_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            photo = profile.photos.get(id=photo_id)
            photo.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except NannyPhoto.DoesNotExist:
            return Response(
                {'detail': 'Photo not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )


class TimeOffView(APIView):
    permission_classes = [IsNanny]

    def get(self, request):
        profile = request.user.nanny_profile
        entries = profile.time_off.all()
        return Response(TimeOffSerializer(entries, many=True).data)

    def post(self, request):
        profile = request.user.nanny_profile
        serializer = TimeOffSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(nanny=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk=None):
        profile = request.user.nanny_profile
        entry_id = pk or request.data.get('id')
        if not entry_id:
            return Response(
                {'detail': 'id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            entry = profile.time_off.get(id=entry_id)
            entry.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TimeOff.DoesNotExist:
            return Response(
                {'detail': 'Time off entry not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
