import axios from 'axios'
import { API_BASE_URL } from './base.api'

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

export const getRecentLoginsApi = async () => {
  const res = await axios.get(`${API_BASE_URL}/admin/recent-logins`, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
  })

  return res.data
}

export const deleteUserByAdminApi = async (userId) => {
  const res = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
  })

  return res.data
}

export const getAdminUsersApi = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(limit))
  if (search) {
    params.set('search', search)
  }

  const res = await axios.get(`${API_BASE_URL}/admin/users?${params.toString()}`, {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
  })

  return res.data
}
