import api from '@/lib/axios'
import type { LoginCredentials, RegisterData, User, ApiResponse } from '@/types'

export const authService = {
  async register(data: RegisterData) {
    const formData = new FormData()
    formData.append('fullname', data.fullname)
    formData.append('email', data.email)
    formData.append('username', data.username)
    formData.append('password', data.password)
    formData.append('avatar', data.avatar)
    if (data.coverImage) {
      formData.append('coverImage', data.coverImage)
    }

    const response = await api.post<ApiResponse<User>>('/users/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async login(credentials: LoginCredentials) {
    const response = await api.post<ApiResponse<{ user: User; accesstoken: string; refreshtoken: string }>>('/users/login', credentials)
    return response.data
  },

  async logout() {
    const response = await api.post<ApiResponse<{}>>('/users/logout')
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get<ApiResponse<User>>('/users/current-user')
    return response.data
  },

  async updateUser(data: { fullname?: string; username?: string; email?: string }) {
    const response = await api.patch<ApiResponse<User>>('/users/update-user', data)
    return response.data
  },

  async updateAvatar(avatar: File) {
    const formData = new FormData()
    formData.append('avatar', avatar)
    const response = await api.patch<ApiResponse<User>>('/users/update-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async changePassword(data: { oldpassword: string; newpassword: string; confirmpassword: string }) {
    const response = await api.post<ApiResponse<{}>>('/users/change-password', data)
    return response.data
  },
}
