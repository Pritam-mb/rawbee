import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import VideoCard from '@/components/VideoCard'
import { userService } from '@/services/userService'
import { videoService } from '@/services/videoService'
import { useAuthStore } from '@/store/authStore'
import type { Video, ChannelStats, User } from '@/types'
import { FiVideo, FiUsers, FiEye, FiThumbsUp } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function MyChannel() {
  const { user } = useAuthStore()
  const { userId } = useParams()
  const [channelOwner, setChannelOwner] = useState<User | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [stats, setStats] = useState<ChannelStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  const isOwnChannel = !userId || userId === user?._id

  useEffect(() => {
    fetchChannelData()
  }, [userId])

  const fetchChannelData = async () => {
    try {
      setLoading(true)
      
      if (isOwnChannel) {
        // Fetch own channel data
        const [videosRes, statsRes] = await Promise.all([
          userService.getChannelVideos(),
          userService.getChannelStats(),
        ])
        setVideos(videosRes.data.data.videos)
        setStats(statsRes.data.data)
        setChannelOwner(user)
      } else {
        // Fetch other user's channel data
        const [userRes, videosRes] = await Promise.all([
          userService.getUserById(userId as string),
          videoService.getAllVideos({ userId, page: 1, limit: 50 })
        ])
        
        setChannelOwner(userRes.data)
        setVideos(videosRes.data?.videos || [])
        
        // Create basic stats from available data
        setStats({
          totalVideos: videosRes.data?.videos?.length || 0,
          totalSubscribers: 0, // This would need to come from backend
          totalViews: 0,
          totalLikes: 0,
        })
      }
    } catch (error: any) {
      console.error('Channel data error:', error)
      toast.error(error.response?.data?.message || 'Failed to load channel data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="ml-64 p-6">Loading...</div>
  }

  return (
    <div className="ml-64">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-blue-900 to-purple-900">
        {channelOwner?.coverImage && (
          <img src={channelOwner.coverImage} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Channel Info */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center space-x-6">
          <img
            src={channelOwner?.avatar}
            alt={channelOwner?.username}
            className="w-32 h-32 rounded-full border-4 border-dark"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{channelOwner?.fullname}</h1>
            <div className="text-gray-400 space-x-4 mt-2">
              <span>@{channelOwner?.username}</span>
              <span>•</span>
              <span>{stats?.totalSubscribers || 0} subscribers</span>
              <span>•</span>
              <span>{stats?.totalVideos || 0} videos</span>
            </div>
          </div>
          {isOwnChannel && (
            <Link
              to="/upload"
              className="px-6 py-3 bg-primary hover:bg-red-600 rounded-full font-semibold transition"
            >
              Upload Video
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="px-6 py-6 grid grid-cols-4 gap-4">
          <div className="bg-secondary rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Videos</p>
                <p className="text-3xl font-bold mt-2">{stats.totalVideos}</p>
              </div>
              <FiVideo className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-secondary rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Subscribers</p>
                <p className="text-3xl font-bold mt-2">{stats.totalSubscribers}</p>
              </div>
              <FiUsers className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <div className="bg-secondary rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Views</p>
                <p className="text-3xl font-bold mt-2">{stats.totalViews}</p>
              </div>
              <FiEye className="w-12 h-12 text-purple-500" />
            </div>
          </div>
          <div className="bg-secondary rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Likes</p>
                <p className="text-3xl font-bold mt-2">{stats.totalLikes}</p>
              </div>
              <FiThumbsUp className="w-12 h-12 text-pink-500" />
            </div>
          </div>
        </div>
      )}

      {/* Videos */}
      <div className="px-6 py-6">
        <h2 className="text-2xl font-bold mb-6">
          {isOwnChannel ? 'My Videos' : `${channelOwner?.username}'s Videos`}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl mb-4">No videos uploaded yet</p>
            {isOwnChannel && (
              <Link
                to="/upload"
                className="inline-block px-6 py-3 bg-primary hover:bg-red-600 rounded-full font-semibold transition"
              >
                Upload Your First Video
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
