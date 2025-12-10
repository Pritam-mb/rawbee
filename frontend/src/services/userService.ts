import api from '@/lib/axios'
import type { User, Video, ChannelStats, ApiResponse } from '@/types'

export const userService = {
  async getUserChannelProfile(username: string) {
    const response = await api.get<ApiResponse<User>>(`/users/channel/${username}`)
    return response.data
  },
  
  async getUserById(userId: string) {
    const response = await api.get<ApiResponse<User>>(`/users/user/${userId}`)
    return response.data
  },

  async videos(userId: string) {
    const response = await api.get<ApiResponse<{ count: number; videos: Video[] }>>(`/video/${userId}`)
    return response.data
  },
  async getWatchHistory() {
    const response = await api.get<ApiResponse<Video[]>>('/users/watch-history')
    return response.data
  },

  async getChannelStats() {
    const response = await api.get<ApiResponse<ChannelStats>>('/dashboard/stats')
    return response
  },

  async getChannelVideos() {
    const response = await api.get<ApiResponse<{ count: number; videos: Video[] }>>('/dashboard/videos')
    return response
  },
}
