import axios from 'axios'

const configuredBase = (import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')
const isLocalFrontend = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
const localDevBackend = (import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:3000').replace(/\/$/, '')

const rawApiBase = isLocalFrontend ? localDevBackend : configuredBase

export const API_BASE_URL = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`

export const setAuthToken = (token) => {
	if (token) {
		localStorage.setItem('authToken', token)
		axios.defaults.headers.common.Authorization = `Bearer ${token}`
		return
	}

	localStorage.removeItem('authToken')
	delete axios.defaults.headers.common.Authorization
}

axios.defaults.withCredentials = true

const storedToken = localStorage.getItem('authToken')
if (storedToken) {
	axios.defaults.headers.common.Authorization = `Bearer ${storedToken}`
}
