import { create } from 'zustand'

interface SearchFiltersState {
  city: string
  languages: string[]
  specializations: string[]
  minRate: number | null
  maxRate: number | null
  verifiedOnly: boolean
  searchQuery: string
  sortBy: 'relevance' | 'rating' | 'price_low' | 'price_high' | 'experience'

  setCity: (city: string) => void
  toggleLanguage: (lang: string) => void
  toggleSpecialization: (spec: string) => void
  setMinRate: (rate: number | null) => void
  setMaxRate: (rate: number | null) => void
  setVerifiedOnly: (verified: boolean) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sort: SearchFiltersState['sortBy']) => void
  clearFilters: () => void
}

const initialState = {
  city: '',
  languages: [] as string[],
  specializations: [] as string[],
  minRate: null as number | null,
  maxRate: null as number | null,
  verifiedOnly: false,
  searchQuery: '',
  sortBy: 'relevance' as const,
}

export const useSearchFiltersStore = create<SearchFiltersState>((set) => ({
  ...initialState,

  setCity: (city) => set({ city }),
  toggleLanguage: (lang) =>
    set((s) => ({
      languages: s.languages.includes(lang)
        ? s.languages.filter((l) => l !== lang)
        : [...s.languages, lang],
    })),
  toggleSpecialization: (spec) =>
    set((s) => ({
      specializations: s.specializations.includes(spec)
        ? s.specializations.filter((sp) => sp !== spec)
        : [...s.specializations, spec],
    })),
  setMinRate: (rate) => set({ minRate: rate }),
  setMaxRate: (rate) => set({ maxRate: rate }),
  setVerifiedOnly: (verified) => set({ verifiedOnly: verified }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  clearFilters: () => set(initialState),
}))
