import { http, publicHttp } from '../api/http'
import { unwrapUser } from '../lib/apiHelpers'

export async function login({ email, password }) {
  const { data } = await publicHttp.post('/api/auth/login/', {
    email,
    password,
  })
  const access = data.access
  const refresh = data.refresh
  if (!access) throw new Error('Invalid login response')
  const user = data.user != null ? data.user : await fetchUserWithAccess(access)
  return { access, refresh, user }
}

async function fetchUserWithAccess(access) {
  const { data } = await publicHttp.get('/api/auth/me/', {
    headers: { Authorization: `Bearer ${access}` },
  })
  return unwrapUser(data)
}

export async function register(payload) {
  const body = {
    email: payload.email,
    username: payload.username,
    password: payload.password,
  }
  if (payload.full_name != null && String(payload.full_name).trim()) {
    body.full_name = String(payload.full_name).trim()
  }
  if (payload.role === 'consumer' || payload.role === 'creator') {
    body.role = payload.role
  }
  const { data } = await publicHttp.post('/api/auth/register/', body)
  if (data.access) {
    const user = await fetchUserWithAccess(data.access)
    return {
      access: data.access,
      refresh: data.refresh,
      user,
    }
  }
  return data
}

export async function getMe() {
  const { data } = await http.get('/api/auth/me/')
  return unwrapUser(data)
}

/** PATCH `/api/auth/me/` — username, full_name, email (partial). */
export async function updateProfile(payload) {
  const { data } = await http.patch('/api/auth/me/', payload)
  return unwrapUser(data)
}

export async function refreshTokens(refresh) {
  const { data } = await publicHttp.post('/api/auth/token/refresh/', {
    refresh,
  })
  return data
}
