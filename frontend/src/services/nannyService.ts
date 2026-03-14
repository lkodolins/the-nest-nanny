import apiClient from '../lib/api/client'
import type { NannyProfile, NannyCard, NannyAvailability } from '../types/nanny'
import type { DRFPaginatedResponse } from '../types/api'

// ── Search / Browse ─────────────────────────────────────

export interface NannySearchFilters {
  city?: string
  ageGroups?: string[]
  specializations?: string[]
  languages?: string[]
  minRate?: number
  maxRate?: number
  minRating?: number
  isVerified?: boolean
  isAvailable?: boolean
  sortBy?: 'rating' | 'rate_asc' | 'rate_desc' | 'experience' | 'reviews'
  page?: number
  limit?: number
  query?: string
}

export async function searchNannies(
  filters: NannySearchFilters,
): Promise<DRFPaginatedResponse<NannyCard>> {
  const { data } = await apiClient.get<DRFPaginatedResponse<NannyCard>>(
    'nannies/search/',
    { params: filters },
  )
  return data
}

export async function getNannyProfile(
  nannyId: string,
): Promise<NannyProfile> {
  const { data } = await apiClient.get<NannyProfile>(
    `nannies/${nannyId}/`,
  )
  return data
}

export async function getFeaturedNannies(): Promise<NannyCard[]> {
  const { data } = await apiClient.get<NannyCard[]>(
    'nannies/featured/',
  )
  return data
}

// ── Nanny self-service ──────────────────────────────────

export async function updateNannyProfile(
  payload: Partial<NannyProfile>,
): Promise<NannyProfile> {
  const { data } = await apiClient.patch<NannyProfile>(
    'nannies/me/',
    payload,
  )
  return data
}

export async function uploadNannyPhoto(
  file: File,
  isPrimary?: boolean,
): Promise<{ url: string; id: string }> {
  const formData = new FormData()
  formData.append('image', file)
  if (isPrimary) formData.append('is_primary', 'true')

  const { data } = await apiClient.post<{ url: string; id: string }>(
    'nannies/me/photos/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getNannyAvailability(
  _nannyId?: string | number,
): Promise<NannyAvailability[]> {
  // Backend only supports me/availability/ for the authenticated nanny
  const { data } = await apiClient.get<NannyAvailability[]>(
    'nannies/me/availability/',
  )
  return data
}

export async function setNannyAvailability(
  slots: Omit<NannyAvailability, 'id'>[],
): Promise<NannyAvailability[]> {
  // Backend expects a flat array of slot objects, not wrapped in { slots }
  const { data } = await apiClient.put<NannyAvailability[]>(
    'nannies/me/availability/',
    slots,
  )
  return data
}

export async function getOwnNannyProfile(): Promise<NannyProfile> {
  const { data } = await apiClient.get<NannyProfile>(
    'nannies/me/',
  )
  return data
}

/** Convenience object for hooks that import { nannyService } */
export const nannyService = {
  searchNannies,
  getNannyProfile,
  getFeaturedNannies,
  updateNannyProfile,
  uploadNannyPhoto,
  getNannyAvailability,
  setNannyAvailability,
  getOwnNannyProfile,
}
