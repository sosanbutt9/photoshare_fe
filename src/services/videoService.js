import { http } from '../api/http'
import { unwrapVideo } from '../lib/apiHelpers'

export async function listVideos(params = {}) {
  const { data } = await http.get('/api/videos/', { params })
  return data
}

export async function getVideo(id) {
  const { data } = await http.get(`/api/videos/${id}/`)
  return unwrapVideo(data)
}

export async function createVideo(formData) {
  const { data } = await http.post('/api/videos/', formData)
  return unwrapVideo(data)
}

export async function updateVideo(id, body) {
  const { data } = await http.patch(`/api/videos/${id}/`, body)
  return unwrapVideo(data)
}

export async function deleteVideo(id) {
  const { data } = await http.delete(`/api/videos/${id}/`)
  return data
}

export async function searchVideos(q, extraParams = {}) {
  const { data } = await http.get('/api/videos/search/', {
    params: { q, ...extraParams },
  })
  return data
}
