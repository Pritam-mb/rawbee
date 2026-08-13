import { Link } from 'react-router-dom'
import { memo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { Video } from '@/types'

interface VideoCardProps {
  video: Video
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getOptimizedCloudinaryUrl = (url: string, width = 500) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/w_${width}/f_auto/q_auto/`);
};

const formatViews = (views: number) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`
  }
  return views.toString()
}

const VideoCard = memo(function VideoCard({ video }: VideoCardProps) {
  return (
    <div className="group cursor-pointer">
      <Link to={`/video/${video._id}`} className="block">
        <div className="relative">
          <img
            src={getOptimizedCloudinaryUrl(video.thumbnail, 500)}
            alt={video.title}
            className="w-full aspect-video object-cover rounded-lg group-hover:rounded-none transition-all"
          />
          <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 text-xs rounded">
            {formatDuration(video.duration)}
          </span>
        </div>
      </Link>
      
      <div className="flex mt-3 gap-3">
        <Link to={`/channel/${video.owner.username}`} className="flex-shrink-0">
          <img
            src={getOptimizedCloudinaryUrl(video.owner.avatar, 100)}
            alt={video.owner.username}
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/video/${video._id}`}>
            <h3 className="font-semibold line-clamp-2 group-hover:text-blue-400 transition">
              {video.title}
            </h3>
          </Link>
          <Link
            to={`/channel/${video.owner.username}`}
            className="text-sm text-gray-400 hover:text-white block mt-1"
          >
            {video.owner.fullname}
          </Link>
          <div className="text-sm text-gray-400 mt-1">
            {formatViews(video.views)} views • {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  )
})

export default VideoCard
