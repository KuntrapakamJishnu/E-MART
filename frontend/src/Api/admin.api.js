import axios from 'axios'

const API_BASE_URL = (import.meta.env.VITE_BASE_URL || '').replace(/\/$/, '')

export const getPendingSellersApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/admin/pending-sellers`, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
  })

  return res.data
}

export const approveSellerApi = async (sellerId) => {
  const res = await axios.post(`${API_BASE_URL}/admin/approve-seller/${sellerId}`, {}, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
  })

  return res.data
}

export const getPendingProductsApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/product/admin/pending`, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
  })

  return res.data
}

export const approveProductApi = async (productId) => {
  const res = await axios.post(`${API_BASE_URL}/product/admin/approve/${productId}`, {}, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
  })

  return res.data
}
