import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import VideoCard from '@/components/VideoCard'
import { userService } from '@/services/userService'
import { videoService } from '@/services/videoService'
import { subscriptionService } from '@/services/subscriptionService'
import type { User, Video } from '@/types'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function Channel() {
  const { username } = useParams<{ username: string }>()
  const { user: currentUser } = useAuthStore()
  const [channel, setChannel] = useState<User | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (username) {
      fetchChannel()
      fetchVideos()
    }
  }, [username])

  const fetchChannel = async () => {
    try {
      const response = await userService.getUserChannelProfile(username!)
      setChannel(response.data)
      setIsSubscribed(response.data.issubscribed || false)
    } catch (error) {
      toast.error('Failed to load channel')
    } finally {
      setLoading(false)
    }
  }

  const fetchVideos = async () => {
    try {
      const response = await videoService.getAllVideos({ userId: username })
      setVideos(response.data.videos)
    } catch (error) {
      console.error('Failed to load videos')
    }
  }

  const handleSubscribe = async () => {
    if (!currentUser || !channel) {
      toast.error('Please login to subscribe')
      return
    }
    try {
      await subscriptionService.toggleSubscription(channel._id)
      setIsSubscribed(!isSubscribed)
      toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed!')
    } catch (error) {
      toast.error('Failed to toggle subscription')
    }
  }

  if (loading) {
    return <div className="ml-64 p-6">Loading...</div>
  }

  if (!channel) return null

  return (
    <div className="ml-64">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-purple-900 to-pink-900">
        {channel.coverImage && (
          <img src={channel.coverImage} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Channel Info */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center space-x-6">
          <img
            src={channel.avatar}
            alt={channel.username}
            className="w-32 h-32 rounded-full border-4 border-dark"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{channel.fullname}</h1>
            <div className="text-gray-400 space-x-4 mt-2">
              <span>@{channel.username}</span>
              <span>•</span>
              <span>{channel.subscriberscount || 0} subscribers</span>
              <span>•</span>
              <span>{videos.length} videos</span>
            </div>
          </div>
          {currentUser && currentUser.username !== channel.username && (
            <button
              onClick={handleSubscribe}
              className={`px-6 py-3 rounded-full font-semibold transition ${
                isSubscribed
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-primary hover:bg-red-600'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      {/* Videos */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No videos yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
