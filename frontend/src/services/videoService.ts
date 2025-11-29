import api from '@/lib/axios'
import type { Video, ApiResponse } from '@/types'

export const videoService = {
  async getAllVideos(params?: {
    page?: number
    limit?: number
    query?: string
    sortBy?: string
    sortType?: 'asc' | 'desc'
    userId?: string
  }) {
    const response = await api.get<ApiResponse<{ videos: Video[]; pagination: any }>>('/videos/get-videos', { params })
    return response.data
  },

  async getVideoById(videoId: string) {
    const response = await api.get<ApiResponse<Video>>(`/videos/video/${videoId}`)
    return response.data
  },

  async uploadVideo(data: { title: string; description: string; videoFile: File; thumbnail: File }) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('videoFile', data.videoFile)
    formData.append('thumbnail', data.thumbnail)

    const response = await api.post<ApiResponse<Video>>('/videos/upload-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async updateVideo(videoId: string, data: { title?: string; description?: string; thumbnail?: File }) {
    const formData = new FormData()
    if (data.title) formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail)

    const response = await api.patch<ApiResponse<Video>>(`/videos/video/${videoId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteVideo(videoId: string) {
    const response = await api.delete<ApiResponse<null>>(`/videos/video/${videoId}`)
    return response.data
  },

  async togglePublishStatus(videoId: string) {
    const response = await api.patch<ApiResponse<Video>>(`/videos/video/toggle-publish/${videoId}`)
    return response.data
  },
}
