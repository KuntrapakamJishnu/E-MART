const rawApiBase = (import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

export const API_BASE_URL = rawApiBase.endsWith('/api') ? rawApiBase : `${rawApiBase}/api`
