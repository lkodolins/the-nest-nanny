from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FamilyProfile, Favorite
from .serializers import FamilyProfileSerializer, FavoriteSerializer
from apps.nannies.models import NannyProfile


class IsFamily(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'family'


class FamilyProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsFamily]
    serializer_class = FamilyProfileSerializer

    def get_object(self):
        return FamilyProfile.objects.prefetch_related(
            'preferred_languages'
        ).get(user=self.request.user)


class FavoriteListView(generics.ListAPIView):
    permission_classes = [IsFamily]
    serializer_class = FavoriteSerializer

    def get_queryset(self):
        return Favorite.objects.filter(
            family=self.request.user.family_profile
        ).select_related(
            'nanny__user'
        ).prefetch_related(
            'nanny__languages', 'nanny__specializations'
        )


class FavoriteToggleView(APIView):
    permission_classes = [IsFamily]

    def post(self, request):
        nanny_id = request.data.get('nanny_id')
        if not nanny_id:
            return Response(
                {'detail': 'nanny_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            nanny = NannyProfile.objects.get(id=nanny_id)
        except NannyProfile.DoesNotExist:
            return Response(
                {'detail': 'Nanny not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        family_profile = request.user.family_profile
        favorite, created = Favorite.objects.get_or_create(
            family=family_profile, nanny=nanny
        )
        if created:
            return Response(
                FavoriteSerializer(favorite).data,
                status=status.HTTP_201_CREATED,
            )
        return Response({'detail': 'Already in favorites.'})

    def delete(self, request):
        nanny_id = request.data.get('nanny_id')
        if not nanny_id:
            return Response(
                {'detail': 'nanny_id is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        family_profile = request.user.family_profile
        deleted, _ = Favorite.objects.filter(
            family=family_profile, nanny_id=nanny_id
        ).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {'detail': 'Favorite not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )
