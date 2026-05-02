/** Cookie name (and legacy localStorage key for one-time migration). */
const AUTH_KEY = 'photoshare_auth_v1'

/** Keep cookies available across visits; refresh/access lifetimes are enforced by the API. */
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30

function readCookie(name) {
  if (typeof document === 'undefined') return null
  const parts = document.cookie.split('; ')
  for (const part of parts) {
    const i = part.indexOf('=')
    if (i === -1) continue
    const key = part.slice(0, i)
    if (key === name) {
      return decodeURIComponent(part.slice(i + 1))
    }
  }
  return null
}

function writeCookie(name, value, maxAgeSec) {
  if (typeof document === 'undefined') return
  let cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax`
  if (globalThis.location?.protocol === 'https:') cookie += '; Secure'
  document.cookie = cookie
}

function eraseCookie(name) {
  if (typeof document === 'undefined') return
  let cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
  if (globalThis.location?.protocol === 'https:') cookie += '; Secure'
  document.cookie = cookie
}

function parsePayload(raw) {
  if (!raw) return null
  const data = JSON.parse(raw)
  if (!data?.access) return null
  return { access: data.access, refresh: data.refresh ?? null }
}

export function loadStoredTokens() {
  try {
    const fromCookie = parsePayload(readCookie(AUTH_KEY))
    if (fromCookie) return fromCookie

    if (typeof localStorage === 'undefined') return null
    const legacy = localStorage.getItem(AUTH_KEY)
    if (!legacy) return null
    const data = parsePayload(legacy)
    if (!data) {
      localStorage.removeItem(AUTH_KEY)
      return null
    }
    saveStoredTokens(data.access, data.refresh)
    localStorage.removeItem(AUTH_KEY)
    return data
  } catch {
    return null
  }
}

export function saveStoredTokens(access, refresh) {
  if (!access) {
    clearStoredTokens()
    return
  }
  writeCookie(AUTH_KEY, JSON.stringify({ access, refresh: refresh ?? null }), COOKIE_MAX_AGE_SEC)
}

export function clearStoredTokens() {
  eraseCookie(AUTH_KEY)
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(AUTH_KEY)
  } catch {
    /* ignore */
  }
}
