/**
 * API base URL for axios and related helpers.
 * - If VITE_API_URL is set, use it (any environment).
 * - In Vite dev without override, use `/api` so the dev-server proxy hits your local backend.
 * - Production build without VITE_API_URL falls back to localhost (set VITE_API_URL in .env.production).
 */
export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  if (import.meta.env.DEV) return '/api'
  if (typeof window !== 'undefined') {
    // If running on Netlify or standalone frontend host, default to Render backend
    if (window.location.hostname.includes('netlify.app') || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
      return 'https://zora-solutions.onrender.com/api'
    }
    return '/api'
  }
  return 'https://zora-solutions.onrender.com/api'
}

/** Origin for Socket.IO / absolute media when API is same-origin in dev */
export function getSocketOrigin() {
  const base = getApiBaseUrl()
  if (base.startsWith('http')) return base.replace(/\/api\/?$/i, '') || window.location.origin
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('netlify.app') || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
      return 'https://zora-solutions.onrender.com'
    }
    return window.location.origin
  }
  return 'https://zora-solutions.onrender.com'
}
