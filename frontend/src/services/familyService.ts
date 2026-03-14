import { apiClient } from '@/lib/api/client'
import type { FamilyProfile } from '@/types/user'
import type { NannyCard } from '@/types/nanny'

export const familyService = {
  getProfile: (): Promise<FamilyProfile> =>
    apiClient.get('families/profile/').then(r => r.data),

  updateProfile: (data: Partial<FamilyProfile>): Promise<FamilyProfile> =>
    apiClient.patch('families/profile/', data).then(r => r.data),

  getFavorites: (): Promise<{ id: number; nanny: NannyCard; created_at: string }[]> =>
    apiClient.get('families/favorites/').then(r => {
      const data = r.data
      const items = Array.isArray(data) ? data : (data?.results ?? [])
      // Backend returns nanny_profile (full object) and nanny (just ID) — normalize
      return items.map((item: Record<string, unknown>) => ({
        ...item,
        nanny: item.nanny_profile ?? item.nanny,
      }))
    }),

  addFavorite: (nannyId: number): Promise<void> =>
    apiClient.post('families/favorites/toggle/', { nanny_id: nannyId }).then(() => {}),

  removeFavorite: (nannyId: number): Promise<void> =>
    apiClient.delete('families/favorites/toggle/', { data: { nanny_id: nannyId } }).then(() => {}),
}
