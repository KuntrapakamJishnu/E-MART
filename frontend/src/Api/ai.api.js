import axios from "axios"
import { API_BASE_URL } from "./base.api"

export const chatWithAiApi = async (payload) => {
  const res = await axios.post(`${API_BASE_URL}/ai/chat`, payload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  })

  return res.data
}

export const getAiRecommendationsApi = async ({ query, limit = 6 }) => {
  const res = await axios.get(`${API_BASE_URL}/ai/recommendations`, {
    params: {
      query: query || undefined,
      limit
    },
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  })

  return res.data
}

export const generateAiDescriptionApi = async (payload) => {
  const res = await axios.post(`${API_BASE_URL}/ai/generate-description`, payload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  })

  return res.data
}
