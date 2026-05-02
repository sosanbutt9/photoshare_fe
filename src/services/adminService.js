import { http } from '../api/http'

export async function getAdminStats() {
  const { data } = await http.get('/api/admin/stats/')
  return data
}
