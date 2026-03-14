import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nannyService } from '@/services/nannyService'
import { queryKeys } from '@/config/queryKeys'

export function useNannySearch(filters: Record<string, unknown>) {
  return useInfiniteQuery({
    queryKey: queryKeys.nannies.search(filters),
    queryFn: ({ pageParam = 1 }: { pageParam: number }) => nannyService.searchNannies({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined
      // Extract page number from the DRF next URL
      const url = new URL(lastPage.next, 'http://localhost')
      const page = url.searchParams.get('page')
      return page ? Number(page) : undefined
    },
    initialPageParam: 1,
    staleTime: 30_000,
  })
}

export function useNannyProfile(id: string) {
  return useQuery({
    queryKey: queryKeys.nannies.detail(id),
    queryFn: () => nannyService.getNannyProfile(id),
    staleTime: 60_000,
    enabled: !!id,
  })
}

export function useFeaturedNannies() {
  return useQuery({
    queryKey: queryKeys.nannies.featured(),
    queryFn: () => nannyService.getFeaturedNannies(),
    staleTime: 300_000,
  })
}

export function useOwnNannyProfile() {
  return useQuery({
    queryKey: [...queryKeys.nannies.all, 'me'],
    queryFn: () => nannyService.getOwnNannyProfile(),
    staleTime: 60_000,
  })
}

export function useNannyAvailability(nannyId?: string | number) {
  return useQuery({
    queryKey: queryKeys.nannies.availability(String(nannyId ?? 'me')),
    queryFn: () => nannyService.getNannyAvailability(nannyId),
    enabled: !!nannyId,
  })
}

export function useSetNannyAvailability() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slots: Parameters<typeof nannyService.setNannyAvailability>[0]) =>
      nannyService.setNannyAvailability(slots),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nannies'] })
    },
  })
}

export function useUpdateNannyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => nannyService.updateNannyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nannies'] })
    },
  })
}
