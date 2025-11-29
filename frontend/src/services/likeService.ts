import api from '@/lib/axios'
import type { Video, ApiResponse } from '@/types'

export const likeService = {
  async toggleVideoLike(videoId: string) {
    const response = await api.post<ApiResponse<null>>(`/likes/toggle/v/${videoId}`)
    return response.data
  },

  async toggleCommentLike(commentId: string) {
    const response = await api.post<ApiResponse<null>>(`/likes/toggle/c/${commentId}`)
    return response.data
  },

  async getLikedVideos() {
    const response = await api.get<ApiResponse<{ count: number; likedvideos: Array<{ video: Video }> }>>('/likes/videos')
    return response.data
  },
}
