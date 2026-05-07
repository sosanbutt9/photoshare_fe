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

export async function updatePhoto(id, body) {
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
