import axios, { AxiosHeaders } from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

/** Unauthenticated requests (login, register, refresh) — no Bearer header injection. */
export const publicHttp = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Authenticated app API — attaches access token and refreshes on 401. */
export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let getState = () => ({ auth: {} })
let authCallbacks = {
  onTokenRefresh: () => {},
  onLogout: () => {},
}

let refreshPromise = null

export function bindHttpStore(store, callbacks) {
  getState = () => store.getState()
  authCallbacks = callbacks
}

http.interceptors.request.use((config) => {
  // Default Content-Type is application/json; axios then turns FormData into JSON (files become {}).
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const headers = AxiosHeaders.from(config.headers)
    headers.delete('Content-Type')
    config.headers = headers
  }
  const token = getState().auth?.access
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    const url = String(original?.url || original?.config?.url || '')

    if (status !== 401 || original?._retry) {
      return Promise.reject(error)
    }

    if (url.includes('/api/auth/token/refresh/') || url.includes('/api/auth/login/')) {
      authCallbacks.onLogout()
      return Promise.reject(error)
    }

    const refresh = getState().auth?.refresh
    if (!refresh) {
      authCallbacks.onLogout()
      return Promise.reject(error)
    }

    if (!refreshPromise) {
      refreshPromise = publicHttp
        .post('/api/auth/token/refresh/', { refresh })
        .then((res) => {
          const access = res.data?.access
          const newRefresh = res.data?.refresh ?? refresh
          if (!access) throw new Error('No access token in refresh response')
          authCallbacks.onTokenRefresh({ access, refresh: newRefresh })
          return access
        })
        .catch((e) => {
          authCallbacks.onLogout()
          throw e
        })
        .finally(() => {
          refreshPromise = null
        })
    }

    try {
      const access = await refreshPromise
      original._retry = true
      original.headers.Authorization = `Bearer ${access}`
      return http(original)
    } catch (e) {
      return Promise.reject(e)
    }
  }
)
