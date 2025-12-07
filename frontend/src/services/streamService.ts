import api from '@/lib/axios'

export const streamService = {
  // Start a new stream
  startStream: async (data: { title: string; description?: string }) => {
    const response = await api.post('/streams/start', data)
    return response.data
  },

  // End a stream
  endStream: async (streamId: string) => {
    const response = await api.post(`/streams/${streamId}/end`)
    return response.data
  },

  // Get all live streams
  getLiveStreams: async () => {
    const response = await api.get('/streams/live')
    return response.data
  },

  // Get stream by ID
  getStreamById: async (streamId: string) => {
    const response = await api.get(`/streams/${streamId}`)
    return response.data
  },

  // Join a stream
  joinStream: async (streamId: string) => {
    const response = await api.post(`/streams/${streamId}/join`)
    return response.data
  },

  // Leave a stream
  leaveStream: async (streamId: string) => {
    const response = await api.post(`/streams/${streamId}/leave`)
    return response.data
  },

  // Toggle chat
  toggleChat: async (streamId: string) => {
    const response = await api.patch(`/streams/${streamId}/toggle-chat`)
    return response.data
  },

  // Get stream history
  getStreamHistory: async () => {
    const response = await api.get('/streams/history')
    return response.data
  },
}
