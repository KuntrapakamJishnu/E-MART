import axios from "axios"

const API_BASE_URL = (import.meta.env.VITE_BASE_URL || "https://campuskartai.onrender.com/api").replace(/\/$/, "")

export const createInterviewReviewApi = async (payload) => {
  const res = await axios.post(`${API_BASE_URL}/interview-review/create`, payload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  })

  return res.data
}

export const getInterviewReviewListApi = async ({ company = "", minRating = 0 } = {}) => {
  const res = await axios.get(`${API_BASE_URL}/interview-review/list`, {
    params: {
      company: company || undefined,
      minRating: minRating || undefined
    },
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  })

  return res.data
}

export const updateInterviewReviewApi = async ({ id, payload }) => {
  const res = await axios.patch(`${API_BASE_URL}/interview-review/update/${id}`, payload, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  })

  return res.data
}

export const deleteInterviewReviewApi = async (id) => {
  const res = await axios.delete(`${API_BASE_URL}/interview-review/delete/${id}`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  })

  return res.data
}

export const toggleHelpfulInterviewReviewApi = async (id) => {
  const res = await axios.post(`${API_BASE_URL}/interview-review/helpful/${id}`, {}, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  })

  return res.data
}

export const getInterviewReviewStatsApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/interview-review/stats`, {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  })

  return res.data
}
