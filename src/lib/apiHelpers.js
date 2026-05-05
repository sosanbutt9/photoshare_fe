export function normalizeList(data) {
  if (Array.isArray(data)) return data
  if (data?.results && Array.isArray(data.results)) return data.results
  return []
}

/** Auth/me and similar: `{ success, user }` */
export function unwrapUser(data) {
  if (data?.user) return data.user
  return data
}

/** Photo create/retrieve/update: `{ success, photo }` */
export function unwrapPhoto(data) {
  if (data?.photo) return data.photo
  return data
}

/** Video create/retrieve/update: `{ success, video }` */
export function unwrapVideo(data) {
  if (data?.video) return data.video
  return data
}

export function photoImageUrl(photo) {
  if (!photo) return ''
  const raw = photo.image || photo.image_url || photo.file || photo.url
  if (!raw) return ''
  if (typeof raw === 'string' && (raw.startsWith('http') || raw.startsWith('data:'))) {
    return raw
  }
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  if (typeof raw === 'string') return `${base}${raw.startsWith('/') ? '' : '/'}${raw}`
  return ''
}

/** Ordered image URLs for a post (carousel). Uses ``photo.media`` when present (detail), else cover only. */
export function photoMediaUrls(photo) {
  if (!photo) return []
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  const absolutize = (raw) => {
    if (!raw) return ''
    if (typeof raw === 'string' && (raw.startsWith('http') || raw.startsWith('data:'))) return raw
    if (typeof raw === 'string') return `${base}${raw.startsWith('/') ? '' : '/'}${raw}`
    return ''
  }
  if (Array.isArray(photo.media) && photo.media.length > 0) {
    return photo.media.map(absolutize).filter(Boolean)
  }
  const single = photoImageUrl(photo)
  return single ? [single] : []
}

export function videoFileUrl(video) {
  if (!video) return ''
  const raw = video.video || video.file || video.url
  if (!raw) return ''
  if (typeof raw === 'string' && (raw.startsWith('http') || raw.startsWith('data:'))) {
    return raw
  }
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  if (typeof raw === 'string') return `${base}${raw.startsWith('/') ? '' : '/'}${raw}`
  return ''
}

export function videoMediaUrls(video) {
  if (!video) return []
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  const absolutize = (raw) => {
    if (!raw) return ''
    if (typeof raw === 'string' && (raw.startsWith('http') || raw.startsWith('data:'))) return raw
    if (typeof raw === 'string') return `${base}${raw.startsWith('/') ? '' : '/'}${raw}`
    return ''
  }
  if (Array.isArray(video.media) && video.media.length > 0) {
    return video.media.map(absolutize).filter(Boolean)
  }
  const single = videoFileUrl(video)
  return single ? [single] : []
}

export function normalizeRole(role) {
  if (!role) return 'consumer'
  return String(role).toLowerCase()
}

export function formatRoleLabel(role) {
  const r = normalizeRole(role)
  if (r === 'admin') return 'Admin'
  if (r === 'creator') return 'Creator'
  return 'Consumer'
}

/** Full admin dashboard / admin-only APIs (matches backend IsAdminUserRole). */
export function isAdminUser(user) {
  if (!user) return false
  if (user.is_superuser) return true
  return normalizeRole(user.role) === 'admin'
}

/** Creator routes: creators, admins, and Django superusers (matches backend IsCreatorUser). */
export function isCreatorCapable(user) {
  if (!user) return false
  if (user.is_superuser) return true
  const r = normalizeRole(user.role)
  return r === 'creator' || r === 'admin'
}

/**
 * Route guard: user.role must be listed, or superuser may enter admin/creator-only routes.
 * Consumer-only screens stay limited because allowedRoles never includes admin/creator.
 */
export function userMeetsRoleAllowlist(user, allowedRoles) {
  const allowed = allowedRoles.map((r) => String(r).toLowerCase())
  const role = normalizeRole(user?.role)
  if (allowed.includes(role)) return true
  if (user?.is_superuser && allowed.some((r) => r === 'admin' || r === 'creator')) return true
  return false
}
