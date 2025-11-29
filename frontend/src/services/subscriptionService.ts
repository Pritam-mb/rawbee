import api from '@/lib/axios'
import type { ApiResponse } from '@/types'

export const subscriptionService = {
  async toggleSubscription(channelId: string) {
    const response = await api.post<ApiResponse<null>>(`/subscriptions/toggle-subscription/${channelId}`)
    return response.data
  },

  async getChannelSubscribers(channelId: string) {
    const response = await api.get<ApiResponse<any[]>>(`/subscriptions/subscribers/${channelId}`)
    return response.data
  },

  async getSubscribedChannels(subscriberId: string) {
    const response = await api.get<ApiResponse<any[]>>(`/subscriptions/subscribed-channels/${subscriberId}`)
    return response.data
  },
}
