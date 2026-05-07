import { http } from '../api/http'

export async function ratePhoto(photoId, score) {
  const { data } = await http.post(`/api/photos/${photoId}/rate/`, { score })
  return data
}

export async function listRatings(photoId, params = {}) {
  const { data } = await http.get(`/api/photos/${photoId}/ratings/`, { params })
  return data
}

export async function rateVideo(videoId, score) {
  const { data } = await http.post(`/api/videos/${videoId}/rate/`, { score })
  return data
}

export async function listVideoRatings(videoId, params = {}) {
  const { data } = await http.get(`/api/videos/${videoId}/ratings/`, { params })
  return data
}
