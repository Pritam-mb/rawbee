import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class SocketService {
  private socket: Socket | null = null

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      })

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket?.id)
      })

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected')
      })

      this.socket.on('error', (error: any) => {
        console.error('Socket error:', error)
      })
    }
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket() {
    if (!this.socket) {
      return this.connect()
    }
    return this.socket
  }

  // Stream events
  joinStream(streamId: string, userId: string, username: string) {
    this.socket?.emit('join-stream', { streamId, userId, username })
  }

  leaveStream(streamId: string, userId: string, username: string) {
    this.socket?.emit('leave-stream', { streamId, userId, username })
  }

  sendMessage(streamId: string, message: string, userId: string, username: string, avatar: string) {
    this.socket?.emit('send-message', { streamId, message, userId, username, avatar })
  }

  muteParticipant(streamId: string, userId: string, isMuted: boolean) {
    this.socket?.emit('mute-participant', { streamId, userId, isMuted })
  }

  toggleChat(streamId: string, enabled: boolean) {
    this.socket?.emit('toggle-chat', { streamId, enabled })
  }

  endStream(streamId: string) {
    this.socket?.emit('end-stream', { streamId })
  }

  // Event listeners
  onViewerJoined(callback: (data: any) => void) {
    this.socket?.on('viewer-joined', callback)
  }

  onViewerLeft(callback: (data: any) => void) {
    this.socket?.on('viewer-left', callback)
  }

  onViewerCount(callback: (data: any) => void) {
    this.socket?.on('viewer-count', callback)
  }

  onNewMessage(callback: (data: any) => void) {
    this.socket?.on('new-message', callback)
  }

  onParticipantMuted(callback: (data: any) => void) {
    this.socket?.on('participant-muted', callback)
  }

  onChatToggled(callback: (data: any) => void) {
    this.socket?.on('chat-toggled', callback)
  }

  onStreamEnded(callback: () => void) {
    this.socket?.on('stream-ended', callback)
  }

  // WebRTC methods
  hostCreateRoom(streamId: string, userId: string, username: string, avatar: string) {
    this.socket?.emit('host-create-room', { streamId, userId, username, avatar })
  }

  participantJoinRoom(streamId: string, userId: string, username: string, avatar: string) {
    this.socket?.emit('participant-join-room', { streamId, userId, username, avatar })
  }

  sendWebRTCOffer(to: string, from: string, offer: any, streamId: string) {
    this.socket?.emit('webrtc-offer', { to, from, offer, streamId })
  }

  sendWebRTCAnswer(to: string, from: string, answer: any, streamId: string) {
    this.socket?.emit('webrtc-answer', { to, from, answer, streamId })
  }

  sendICECandidate(to: string, candidate: any, streamId: string) {
    this.socket?.emit('ice-candidate', { to, candidate, streamId })
  }

  onUserJoined(callback: (data: any) => void) {
    this.socket?.on('user-joined', callback)
  }

  onUserLeft(callback: (data: any) => void) {
    this.socket?.on('user-left', callback)
  }

  onWebRTCOffer(callback: (data: any) => void) {
    this.socket?.on('webrtc-offer', callback)
  }

  onWebRTCAnswer(callback: (data: any) => void) {
    this.socket?.on('webrtc-answer', callback)
  }

  onICECandidate(callback: (data: any) => void) {
    this.socket?.on('ice-candidate', callback)
  }

  // Remove listeners
  off(event: string, callback?: any) {
    this.socket?.off(event, callback)
  }
}

export const socketService = new SocketService()
