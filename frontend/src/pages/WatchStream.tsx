import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiUsers, FiMessageCircle, FiSend, FiRadio, FiVideoOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { socketService } from '@/services/socketService'
import { streamService } from '@/services/streamService'
import { useAuthStore } from '@/store/authStore'
import { timeAgo } from '@/utils/dateUtils'

export default function WatchStream() {
  const { streamId } = useParams<{ streamId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [stream, setStream] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const [isChatEnabled, setIsChatEnabled] = useState(true)
  const [isLive, setIsLive] = useState(true)
  
  const [comments, setComments] = useState<Array<{id: number, username: string, message: string, timestamp: string, avatar: string}>>([])
  const [newComment, setNewComment] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  // WebRTC Refs
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!streamId) {
      navigate('/live')
      return
    }

    fetchStreamDetails()

    return () => {
      // Cleanup on unmount
      if (user && streamId) {
        socketService.leaveStream(streamId, user._id, user.username)
      }
      socketService.disconnect()
    }
  }, [streamId])

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [comments])

  const fetchStreamDetails = async () => {
    try {
      setLoading(true)
      const response = await streamService.getStreamById(streamId!)
      const streamData = response.data
      
      setStream(streamData)
      setIsChatEnabled(streamData.chatEnabled)
      setIsLive(streamData.isLive)
      setViewerCount(streamData.viewerCount || 0)

      if (streamData.isLive && user) {
        setupSocket()
      }
    } catch (error: any) {
      console.error('Failed to fetch stream:', error)
      toast.error('Stream not found or has ended')
      navigate('/live')
    } finally {
      setLoading(false)
    }
  }

  const setupSocket = () => {
    socketService.connect()
    
    // Join stream room as viewer
    if (user && streamId) {
      socketService.joinStream(streamId, user._id, user.username)
      socketService.participantJoinRoom(streamId, user._id, user.username, user.avatar || '')
    }
    
    // Setup socket listeners
    socketService.onViewerJoined((data) => {
      setViewerCount(data.viewerCount)
    })
    
    socketService.onViewerLeft((data) => {
      setViewerCount(data.viewerCount)
    })
    
    socketService.onViewerCount((data) => {
      setViewerCount(data.viewerCount)
    })
    
    socketService.onNewMessage((message) => {
      setComments(prev => [...prev, message])
    })
    
    socketService.onChatToggled((data) => {
      setIsChatEnabled(data.enabled)
      toast(data.enabled ? 'Chat has been enabled by the host' : 'Chat has been disabled by the host')
    })
    
    socketService.onStreamEnded(() => {
      setIsLive(false)
      toast('This live stream has ended')
    })

    // WebRTC Listeners
    socketService.onWebRTCOffer(async ({ from, offer }) => {
      let peer = peerRef.current
      if (!peer) {
        peer = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        })
        peerRef.current = peer

        peer.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0]
            videoRef.current.muted = true // Ensure autoplay works! Viewers can unmute later if we add controls.
          }
        }

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socketService.sendICECandidate(from, event.candidate, streamId!)
          }
        }
      }

      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peer.createAnswer()
        await peer.setLocalDescription(answer)
        
        socketService.sendWebRTCAnswer(from, socketService.getSocket()!.id, answer, streamId!)
      } catch (err) {
        console.error("Failed to handle offer:", err)
      }
    })

    socketService.onICECandidate(async ({ from, candidate }) => {
      if (peerRef.current) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })
  }

  const handleSendComment = () => {
    if (newComment.trim() && user && streamId) {
      socketService.sendMessage(
        streamId,
        newComment,
        user._id,
        user.username,
        user.avatar || ''
      )
      setNewComment('')
    } else if (!user) {
      toast.error('You must be logged in to chat')
    }
  }

  if (loading) {
    return (
      <div className="ml-64 h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!stream) return null

  return (
    <div className='ml-64 flex flex-row h-[calc(100vh-4rem)] bg-black overflow-hidden'>
      
      {/* Main Content Area (Video + Details) */}
      <div className='flex-[7] flex flex-col border-r border-gray-800 overflow-y-auto'>
        
        {/* Video Player Placeholder */}
        <div className="relative w-full aspect-video bg-gray-950 flex items-center justify-center border-b border-gray-800">
          {!isLive ? (
            <div className="text-center">
              <FiVideoOff className="w-20 h-20 mx-auto text-gray-700 mb-4" />
              <h2 className="text-2xl font-bold text-gray-400">Stream has ended</h2>
              <p className="text-gray-500 mt-2">The host has stopped broadcasting.</p>
            </div>
          ) : (
            <div className="w-full h-full bg-black relative flex items-center justify-center group">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              
              {/* Fallback showing until video loads */}
              <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
                <p className="text-gray-400">Connecting to stream...</p>
              </div>
            </div>
          )}
          
          {/* Top overlays */}
          {isLive && (
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE
              </div>
              <div className="bg-black/60 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded flex items-center gap-2">
                <FiUsers className="w-4 h-4 text-gray-300" />
                {viewerCount} watching
              </div>
            </div>
          )}
        </div>
        
        {/* Stream Details */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-4">{stream.title}</h1>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={stream.host.avatar || 'https://via.placeholder.com/150'} 
                alt={stream.host.username} 
                className="w-12 h-12 rounded-full object-cover bg-gray-800 border border-gray-700"
              />
              <div>
                <h3 className="text-white font-semibold text-lg hover:text-red-400 cursor-pointer">
                  {stream.host.username}
                </h3>
                <p className="text-gray-400 text-sm">
                  Started {timeAgo(stream.startedAt)}
                </p>
              </div>
            </div>
          </div>

          {stream.description && (
            <div className="mt-6 bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-300 whitespace-pre-wrap">{stream.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar: Live Chat */}
      <div className='flex-[3] flex flex-col bg-gray-950 max-w-[400px] border-l border-gray-800 min-w-[300px]'>
        <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <FiMessageCircle className="w-5 h-5 text-gray-400" />
            Live Chat
          </h2>
          <div className="flex items-center gap-1 text-gray-400 text-sm bg-gray-800 px-2 py-1 rounded">
            <FiUsers className="w-3 h-3" />
            {viewerCount}
          </div>
        </div>
        
        {/* Comments List */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <FiMessageCircle className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm">Welcome to live chat!</p>
              <p className="text-xs mt-1">Remember to guard your privacy.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 hover:bg-gray-900/50 p-2 -mx-2 rounded transition-colors">
                <img 
                  src={comment.avatar || 'https://via.placeholder.com/150'} 
                  alt={comment.username}
                  className="w-7 h-7 rounded-full flex-shrink-0 bg-gray-800 mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-300 font-medium text-sm truncate">
                      {comment.username}
                      {comment.username === stream.host.username && (
                        <span className="ml-2 text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded uppercase font-bold">Host</span>
                      )}
                    </span>
                    <span className="text-gray-600 text-[10px] flex-shrink-0">
                      {new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-white text-sm mt-0.5 break-words">{comment.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 bg-gray-900 border-t border-gray-800">
          {!isLive ? (
            <div className="text-center text-gray-500 text-sm py-2">
              Chat is disabled because the stream has ended.
            </div>
          ) : !isChatEnabled ? (
            <div className="text-center text-gray-500 text-sm py-2">
              Chat has been disabled by the host.
            </div>
          ) : !user ? (
            <div className="text-center text-gray-500 text-sm py-2">
              Please login to participate in chat.
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                placeholder="Chat openly..."
                maxLength={200}
                className="flex-1 bg-gray-950 border border-gray-800 text-white px-4 py-2.5 rounded-full focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
              />
              <button
                onClick={handleSendComment}
                disabled={!newComment.trim()}
                className="p-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-full transition-colors flex-shrink-0"
              >
                <FiSend className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
