import { chatWithAiApi, generateAiDescriptionApi, getAiRecommendationsApi } from "@/Api/ai.api"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

const getErrorMessage = (err, fallback) => err?.response?.data?.message || fallback

export const useAiChatHook = () => {
  return useMutation({
    mutationFn: chatWithAiApi,
    onError: (err) => {
      toast.error(getErrorMessage(err, "AI chat failed"))
    }
  })
}

export const useAiRecommendationsHook = (query, limit = 6) => {
  return useQuery({
    queryKey: ["aiRecommendations", query, limit],
    queryFn: () => getAiRecommendationsApi({ query, limit }),
    enabled: Boolean(query && query.trim())
  })
}

export const useGenerateAiDescriptionHook = () => {
  return useMutation({
    mutationFn: generateAiDescriptionApi,
    onError: (err) => {
      toast.error(getErrorMessage(err, "Unable to generate description"))
    }
  })
}
