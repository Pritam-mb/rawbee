import { useState, useEffect } from 'react'
import VideoCard from '@/components/VideoCard'
import { userService } from '@/services/userService'
import type { Video } from '@/types'
import toast from 'react-hot-toast'

export default function WatchHistory() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await userService.getWatchHistory()
      setVideos(response.data)
    } catch (error) {
      toast.error('Failed to load watch history')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 p-6">
      <h1 className="text-3xl font-bold mb-8">Watch History</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      {!loading && videos.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">No watch history yet</p>
        </div>
      )}
    </div>
  )
}
