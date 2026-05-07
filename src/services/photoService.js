import { http } from '../api/http'
import { unwrapPhoto } from '../lib/apiHelpers'

export async function listPhotos(params = {}) {
  const { data } = await http.get('/api/photos/', { params })
  return data
}

export async function getPhoto(id) {
  const { data } = await http.get(`/api/photos/${id}/`)
  return unwrapPhoto(data)
}

export async function createPhoto(formData) {
  const { data } = await http.post('/api/photos/', formData)
  return unwrapPhoto(data)
}

const MAX_IMAGES_PER_POST = 10

/**
 * @param {number|string} id
 * @param {{ title?: string, caption?: string, location?: string, people_present?: string, imageFiles?: File[] }} fields
 */
export async function updatePhoto(id, fields) {
  const { title, caption, location, people_present, imageFiles } = fields
  const files = Array.isArray(imageFiles) ? imageFiles.filter(Boolean) : []
  let body
  if (files.length > 0) {
    if (files.length > MAX_IMAGES_PER_POST) {
      throw new Error(`You can upload at most ${MAX_IMAGES_PER_POST} images per update.`)
    }
    const fd = new FormData()
    fd.append('title', title ?? '')
    fd.append('caption', caption ?? '')
    fd.append('location', location ?? '')
    fd.append('people_present', people_present ?? '')
    files.forEach((file) => fd.append('images', file))
    body = fd
  } else {
    body = { title, caption, location, people_present }
  }
  const { data } = await http.patch(`/api/photos/${id}/`, body)
  return unwrapPhoto(data)
}

export async function deletePhoto(id) {
  const { data } = await http.delete(`/api/photos/${id}/`)
  return data
}

export async function searchPhotos(q, extraParams = {}) {
  const { data } = await http.get('/api/photos/search/', {
    params: { q, ...extraParams },
  })
  return data
}

export async function togglePhotoLike(id) {
  const { data } = await http.post(`/api/photos/${id}/like/`)
  return data
}
