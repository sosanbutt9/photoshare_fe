import { http } from '../api/http'

export async function ratePhoto(photoId, score) {
  const { data } = await http.post(`/api/photos/${photoId}/rate/`, { score })
  return data
}

export async function listRatings(photoId, params = {}) {
  const { data } = await http.get(`/api/photos/${photoId}/ratings/`, { params })
  return data
}
