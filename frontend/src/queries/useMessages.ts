import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagingService } from '@/services/messagingService'
import { queryKeys } from '@/config/queryKeys'

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.messages.conversations(),
    queryFn: () => messagingService.getConversations(),
    staleTime: 10_000,
    refetchInterval: 30_000,
  })
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.messages.conversation(conversationId),
    queryFn: () => messagingService.getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 5_000,
    refetchInterval: 10_000,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      messagingService.sendMessage(conversationId, content),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversation(conversationId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations() })
    },
  })
}
