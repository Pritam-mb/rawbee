import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ReactPlayer from 'react-player'
import { FiThumbsUp, FiThumbsDown, FiShare2 } from 'react-icons/fi'
import { videoService } from '@/services/videoService'
import { commentService } from '@/services/commentService'
import { likeService } from '@/services/likeService'
import { subscriptionService } from '@/services/subscriptionService'
import type { Video, Comment } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

export default function VideoDetail() {
  const { videoId } = useParams<{ videoId: string }>()
  const { user } = useAuthStore()
  const [video, setVideo] = useState<Video | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [useNativePlayer, setUseNativePlayer] = useState(false)

  useEffect(() => {
    if (videoId) {
      fetchVideo()
      fetchComments()
    }
  }, [videoId])

  const fetchVideo = async () => {
    try {
      const response = await videoService.getVideoById(videoId!)
      console.log('Video URL:', response.data.videoFile)
      setVideo(response.data)
    } catch (error) {
      console.error('Video fetch error:', error)
      toast.error('Failed to load video')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await commentService.getVideoComments(videoId!)
      setComments(response.data.comments)
    } catch (error) {
      console.error('Failed to load comments')
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like')
      return
    }
    try {
      await likeService.toggleVideoLike(videoId!)
      setIsLiked(!isLiked)
      toast.success(isLiked ? 'Removed from liked videos' : 'Added to liked videos')
    } catch (error) {
      toast.error('Failed to like video')
    }
  }

  const handleSubscribe = async () => {
    if (!user || !video) {
      toast.error('Please login to subscribe')
      return
    }
    try {
      await subscriptionService.toggleSubscription(video.owner._id)
      setIsSubscribed(!isSubscribed)
      toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed!')
    } catch (error) {
      toast.error('Failed to toggle subscription')
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to comment')
      return
    }
    if (!newComment.trim()) return

    try {
      await commentService.addComment(videoId!, newComment)
      setNewComment('')
      fetchComments()
      toast.success('Comment added')
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  if (loading) {
    return (
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="aspect-video bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-400">Video not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="ml-64 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-4">
          {video.videoFile ? (
            useNativePlayer ? (
              <video
                src={video.videoFile}
                controls
                controlsList="nodownload"
                className="w-full aspect-video"
                onContextMenu={(e) => e.preventDefault()}
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="relative">
                <ReactPlayer
                  url={video.videoFile}
                  controls
                  playing={false}
                  width="100%"
                  height="100%"
                  config={{
                    file: {
                      attributes: {
                        controlsList: 'nodownload',
                      }
                    }
                  }}
                  style={{ aspectRatio: '16/9' }}
                  onReady={() => console.log('Video ready to play')}
                  onError={(e) => {
                    console.error('ReactPlayer error:', e)
                    toast.error('Video player error, switching to native player')
                    setUseNativePlayer(true)
                  }}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setUseNativePlayer(true)}
                    className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                  >
                    Use Native Player
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="aspect-video flex items-center justify-center text-gray-400">
              Video not available
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {video.owner && (
                <>
                  <img
                    src={video.owner.avatar}
                    alt={video.owner.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{video.owner.fullname}</h3>
                    <p className="text-sm text-gray-400">{video.views} views</p>
                  </div>
                  <button
                    onClick={handleSubscribe}
                    className={`px-4 py-2 rounded-full font-semibold transition ${
                      isSubscribed
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-primary hover:bg-red-600'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition ${
                  isLiked ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <FiThumbsUp className="w-5 h-5" />
                <span>Like</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full transition">
                <FiShare2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4 bg-secondary rounded-lg p-4">
            <p className="text-sm whitespace-pre-wrap">{video.description}</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">{comments.length} Comments</h2>

          {user && (
            <form onSubmit={handleAddComment} className="flex items-start space-x-4 mb-8">
              <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-transparent border-b border-gray-700 focus:border-white outline-none pb-2"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setNewComment('')}
                    className="px-4 py-2 text-sm hover:bg-gray-700 rounded-full transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-full transition disabled:opacity-50"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="flex space-x-4">
                <img
                  src={comment.owner.avatar}
                  alt={comment.owner.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{comment.owner.fullname}</span>
                    <span className="text-sm text-gray-400">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1">{comment.content}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center space-x-1 text-sm hover:text-blue-400">
                      <FiThumbsUp className="w-4 h-4" />
                    </button>
                    <button className="flex items-center space-x-1 text-sm hover:text-blue-400">
                      <FiThumbsDown className="w-4 h-4" />
                    </button>
                    <button className="text-sm hover:text-blue-400">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
