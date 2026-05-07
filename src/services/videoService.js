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

const MAX_VIDEOS_PER_POST = 10

/**
 * @param {number|string} id
 * @param {{ title?: string, caption?: string, location?: string, people_present?: string, videoFiles?: File[] }} fields
 */
export async function updateVideo(id, fields) {
  const { title, caption, location, people_present, videoFiles } = fields
  const files = Array.isArray(videoFiles) ? videoFiles.filter(Boolean) : []
  let body
  if (files.length > 0) {
    if (files.length > MAX_VIDEOS_PER_POST) {
      throw new Error(`You can upload at most ${MAX_VIDEOS_PER_POST} videos per update.`)
    }
    const fd = new FormData()
    fd.append('title', title ?? '')
    fd.append('caption', caption ?? '')
    fd.append('location', location ?? '')
    fd.append('people_present', people_present ?? '')
    files.forEach((file) => fd.append('videos', file))
    body = fd
  } else {
    body = { title, caption, location, people_present }
  }
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

export async function toggleVideoLike(id) {
  const { data } = await http.post(`/api/videos/${id}/like/`)
  return data
}
