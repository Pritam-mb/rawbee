import React, { useState } from 'react'
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, FiMessageCircle, FiShare2, FiUsers, FiSend } from 'react-icons/fi'
import toast from 'react-hot-toast'

function Livestream() {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isChatEnabled, setIsChatEnabled] = useState(true)
  const [viewerCount] = useState(142)

  // People in stream with their mute status
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Pritam', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pritam', isMutedByHost: false },
    { id: 2, name: 'Sahil', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sahil', isMutedByHost: false },
    { id: 3, name: 'Rahul', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul', isMutedByHost: false },
    { id: 4, name: 'Arjun', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun', isMutedByHost: true },
  ])

  // Live comments
  const [comments, setComments] = useState<Array<{id: number, username: string, message: string, timestamp: string, avatar: string}>>([])
  const [newComment, setNewComment] = useState('')

  const toggleParticipantMute = (id: number) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, isMutedByHost: !p.isMutedByHost } : p
    ))
  }

  const handleSendComment = () => {
    if (newComment.trim()) {
      setComments([...comments, {
        id: comments.length + 1,
        username: 'Host',
        message: newComment,
        timestamp: 'Just now',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=host'
      }])
      setNewComment('')
    }
  }

  const handleShareStream = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Stream link copied to clipboard!')
  }

  return (
    <div className='ml-64 flex flex-row h-screen overflow-hidden'>
        
      <div className='flex-[7] bg-black border-r-2 border-gray-800 flex flex-col'>
        <div className='flex flex-row justify-between p-4 bg-gray-950'>
            <button className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'>End Stream</button>
            <button className='px-4 py-2 bg-red-500 text-white rounded-full flex items-center gap-2 animate-pulse'>
              <span className='w-2 h-2 bg-white rounded-full'></span>
              LIVE
            </button>
        </div>
        <div className="video h-[50vh] bg-grey-950 border-2 border-red-800 flex items-center justify-center">
          {/* Video player will go here */}
        </div>
        
        {/* Stream Controls */}
        <div className="flex items-center justify-between p-4 bg-gray-950 border-t-2 border-gray-800">
          {/* Viewer Count */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full">
            <FiUsers className="w-5 h-5 text-red-500" />
            <span className="text-white font-semibold">{viewerCount}</span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-colors ${
                isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <FiMicOff className="w-6 h-6 text-white" /> : <FiMic className="w-6 h-6 text-white" />}
            </button>
            
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full transition-colors ${
                !isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoOn ? <FiVideo className="w-6 h-6 text-white" /> : <FiVideoOff className="w-6 h-6 text-white" />}
            </button>

            <button 
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-4 rounded-full transition-colors ${
                isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
            >
              <FiMonitor className="w-6 h-6 text-white" />
            </button>

            <button 
              onClick={() => setIsChatEnabled(!isChatEnabled)}
              className={`p-4 rounded-full transition-colors ${
                isChatEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
              title={isChatEnabled ? 'Disable chat' : 'Enable chat'}
            >
              <FiMessageCircle className="w-6 h-6 text-white" />
            </button>

            <button 
              onClick={handleShareStream}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              title="Share stream link"
            >
              <FiShare2 className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
        
        <div className="details border-t-2 border-gray-800 p-4 text-white bg-black flex-1 overflow-y-auto">
          <h1> freefire live stream</h1>

        </div>
      </div>
      <div className='flex-[3] bg-gray-900 border-l-2 border-gray-800 overflow-y-auto'>
        {/* People in Stream */}
        <div className="p-4">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <FiUsers className="w-5 h-5" />
            People in Stream ({participants.length})
          </h2>
          
          <div className="space-y-2">
            {participants.map((participant) => (
              <div 
                key={participant.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                {/* Left: Avatar */}
                <div className="flex items-center gap-3 flex-1">
                  <img 
                    src={participant.avatar} 
                    alt={participant.name}
                    className="w-10 h-10 rounded-full bg-gray-700"
                  />
                  
                  {/* Middle: Name */}
                  <span className="text-white font-medium">{participant.name}</span>
                </div>
                
                {/* Right: Mute Button */}
                <button
                  onClick={() => toggleParticipantMute(participant.id)}
                  className={`p-2 rounded-full transition-colors ${
                    participant.isMutedByHost 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title={participant.isMutedByHost ? 'Unmute participant' : 'Mute participant'}
                >
                  {participant.isMutedByHost 
                    ? <FiMicOff className="w-4 h-4 text-white" /> 
                    : <FiMic className="w-4 h-4 text-white" />
                  }
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Comments Section */}
        <div className="border-t-2 border-gray-800 flex flex-col h-[50vh]">
          <h2 className="text-white text-lg font-semibold p-4 flex items-center gap-2 bg-gray-950">
            <FiMessageCircle className="w-5 h-5" />
            Live Comments
          </h2>
          
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img 
                  src={comment.avatar} 
                  alt={comment.username}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{comment.username}</span>
                    <span className="text-gray-500 text-xs">{comment.timestamp}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{comment.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment Input */}
          <div className="p-4 bg-gray-950 border-t-2 border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isChatEnabled}
              />
              <button
                onClick={handleSendComment}
                disabled={!isChatEnabled || !newComment.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <FiSend className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Livestream
