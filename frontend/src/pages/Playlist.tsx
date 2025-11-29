import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import VideoCard from '@/components/VideoCard'
import { playlistService } from '@/services/playlistService'
import type { Playlist as PlaylistType } from '@/types'
import toast from 'react-hot-toast'

export default function Playlist() {
  const { playlistId } = useParams<{ playlistId: string }>()
  const [playlist, setPlaylist] = useState<PlaylistType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist()
    }
  }, [playlistId])

  const fetchPlaylist = async () => {
    try {
      const response = await playlistService.getPlaylistById(playlistId!)
      setPlaylist(response.data)
    } catch (error) {
      toast.error('Failed to load playlist')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="ml-64 p-6">Loading...</div>
  }

  if (!playlist) return null

  return (
    <div className="ml-64 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
        {playlist.description && (
          <p className="text-gray-400">{playlist.description}</p>
        )}
        <div className="text-sm text-gray-500 mt-2">
          {playlist.totalVideos} videos
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {playlist.videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      {playlist.videos.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">This playlist is empty</p>
        </div>
      )}
    </div>
  )
}
