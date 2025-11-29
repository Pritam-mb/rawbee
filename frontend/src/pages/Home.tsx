import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import VideoCard from '@/components/VideoCard'
import VideoSkeleton from '@/components/VideoSkeleton'
import { videoService } from '@/services/videoService'
import type { Video } from '@/types'
import toast from 'react-hot-toast'

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')

  useEffect(() => {
    fetchVideos()
  }, [query])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await videoService.getAllVideos({
        query: query || undefined,
        page: 1,
        limit: 20,
      })
      console.log('Home videos response:', response)
      setVideos(response.data.videos)
    } catch (error: any) {
      console.error('Failed to fetch videos:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch videos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {query && (
        <h1 className="text-2xl font-bold mb-6">
          Search results for "{query}"
        </h1>
      )}
      
      <div className="video-grid">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <VideoSkeleton key={i} />)
          : videos.map((video) => <VideoCard key={video._id} video={video} />)}
      </div>

      {!loading && videos.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">No videos found</p>
          <p className="text-gray-500 text-sm mt-2">Upload your first video to get started!</p>
        </div>
      )}
    </div>
  )
}
