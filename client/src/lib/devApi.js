/**
 * API base URL for axios and related helpers.
 * - If VITE_API_URL is set, use it (any environment).
 * - In Vite dev without override, use `/api` so the dev-server proxy hits your local backend.
 * - Production build without VITE_API_URL falls back to localhost (set VITE_API_URL in .env.production).
 */
export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  return '/api'
}

/** Origin for Socket.IO / absolute media when API is same-origin */
export function getSocketOrigin() {
  const base = getApiBaseUrl()
  if (base.startsWith('http')) return base.replace(/\/api\/?$/i, '') || (typeof window !== 'undefined' ? window.location.origin : '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}
