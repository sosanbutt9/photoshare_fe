import { http } from '../api/http'
import { unwrapUser } from '../lib/apiHelpers'

/** Public profile: username, avatar, follower counts, ``is_following`` when logged in. */
export async function getUserProfile(userId) {
  const { data } = await http.get(`/api/auth/users/${userId}/`)
  return unwrapUser(data)
}

export async function followUser(userId) {
  const { data } = await http.post(`/api/auth/users/${userId}/follow/`)
  return data
}

export async function unfollowUser(userId) {
  const { data } = await http.delete(`/api/auth/users/${userId}/follow/`)
  return data
}
