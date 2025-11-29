import api from '@/lib/axios'
import type { Comment, ApiResponse } from '@/types'

export const commentService = {
  async getVideoComments(videoId: string, page = 1, limit = 10) {
    const response = await api.get<ApiResponse<{ comments: Comment[]; pagination: any }>>(`/comments/${videoId}`, {
      params: { page, limit },
    })
    return response.data
  },

  async addComment(videoId: string, content: string) {
    const response = await api.post<ApiResponse<null>>(`/comments/${videoId}`, { content })
    return response.data
  },

  async updateComment(commentId: string, content: string) {
    const response = await api.patch<ApiResponse<null>>(`/comments/c/${commentId}`, { content })
    return response.data
  },

  async deleteComment(commentId: string) {
    const response = await api.delete<ApiResponse<null>>(`/comments/c/${commentId}`)
    return response.data
  },
}
