import api from '@/lib/axios'
import type { Playlist, ApiResponse } from '@/types'

export const playlistService = {
  async createPlaylist(data: { name: string; description?: string }) {
    const response = await api.post<ApiResponse<Playlist>>('/playlists/', data)
    return response.data
  },

  async getUserPlaylists(userId: string) {
    const response = await api.get<ApiResponse<Playlist[]>>(`/playlists/user-playlists/${userId}`)
    return response.data
  },

  async getPlaylistById(playlistId: string) {
    const response = await api.get<ApiResponse<Playlist>>(`/playlists/${playlistId}`)
    return response.data
  },

  async addVideoToPlaylist(playlistId: string, videoId: string) {
    const response = await api.post<ApiResponse<Playlist>>(`/playlists/add-video/${playlistId}`, { videoId })
    return response.data
  },

  async removeVideoFromPlaylist(playlistId: string, videoId: string) {
    const response = await api.post<ApiResponse<Playlist>>(`/playlists/remove-video/${playlistId}`, { videoId })
    return response.data
  },

  async deletePlaylist(playlistId: string) {
    const response = await api.delete<ApiResponse<{}>>(`/playlists/${playlistId}`)
    return response.data
  },

  async updatePlaylist(playlistId: string, data: { name?: string; description?: string }) {
    const response = await api.put<ApiResponse<Playlist>>(`/playlists/${playlistId}`, data)
    return response.data
  },
}
