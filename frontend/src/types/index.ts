export interface User {
  _id: string
  username: string
  email: string
  fullname: string
  avatar: string
  coverImage?: string
  subscriberscount?: number
  subscribedchannelscount?: number
  issubscribed?: boolean
}

export interface Video {
  _id: string
  videoFile: string
  thumbnail: string
  title: string
  description: string
  duration: number
  views: number
  ispublished: boolean
  owner: {
    _id: string
    username: string
    fullname: string
    avatar: string
  }
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id: string
  content: string
  video: string
  owner: {
    _id: string
    username: string
    fullname: string
    avatar: string
  }
  createdAt: string
  updatedAt: string
}

export interface Playlist {
  _id: string
  name: string
  description: string
  videos: Video[]
  owner: {
    _id: string
    username: string
    fullname: string
    avatar: string
  }
  totalVideos: number
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  statuscode: number
  data: T
  message: string
  success: boolean
}

export interface LoginCredentials {
  email?: string
  username?: string
  password: string
}

export interface RegisterData {
  fullname: string
  email: string
  username: string
  password: string
  avatar: File
  coverImage?: File
}

export interface ChannelStats {
  totalVideos: number
  totalSubscribers: number
  totalViews: number
  totalLikes: number
}
