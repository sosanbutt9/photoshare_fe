import { http } from '../api/http'

export async function listComments(photoId) {
  const { data } = await http.get(`/api/photos/${photoId}/comments/`)
  return data
}

export async function createComment(photoId, body) {
  const { data } = await http.post(`/api/photos/${photoId}/comments/`, body)
  return data
}

export async function listVideoComments(videoId) {
  const { data } = await http.get(`/api/videos/${videoId}/comments/`)
  return data
}

export async function createVideoComment(videoId, body) {
  const { data } = await http.post(`/api/videos/${videoId}/comments/`, body)
  return data
}

export async function deleteComment(id) {
  await http.delete(`/api/comments/${id}/`)
}
