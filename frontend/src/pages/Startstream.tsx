import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMonitor, FiVideo } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { streamService } from '@/services/streamService'

function Startstream() {
  const navigate = useNavigate()
  const [streamTitle, setStreamTitle] = useState('')
  const [streamDescription, setStreamDescription] = useState('')
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startScreenShare = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      
      setStream(mediaStream)
      
      // Set video source immediately
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play().catch(err => console.error('Play error:', err))
      }
      
      setIsCapturing(true)
      toast.success('Screen sharing started!')
      
      // Handle when user stops sharing via browser UI
      mediaStream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }
    } catch (error) {
      console.error('Error sharing screen:', error)
      toast.error('Failed to start screen sharing')
    }
  }

  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCapturing(false)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      toast.success('Screen sharing stopped')
    }
  }

  const handleStartStream = async () => {
    if (!streamTitle.trim()) {
      toast.error('Please enter a stream title')
      return
    }
    
    if (!isCapturing) {
      toast.error('Please start screen sharing first')
      return
    }
    
    setLoading(true)
    
    try {
      // Create stream in backend
      const response = await streamService.startStream({
        title: streamTitle,
        description: streamDescription,
      })
      
      // Store stream info in sessionStorage
      sessionStorage.setItem('livestream_id', response.data._id)
      sessionStorage.setItem('livestream_title', streamTitle)
      sessionStorage.setItem('livestream_description', streamDescription)
      sessionStorage.setItem('livestream_active', 'true')
      
      toast.success('Stream created successfully!')
      
      // Navigate to livestream page
      navigate('/livestream')
    } catch (error: any) {
      console.error('Failed to start stream:', error)
      toast.error(error.response?.data?.message || 'Failed to start stream')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='ml-64 max-w-4xl mx-auto p-8'>
      <div className="mb-8">
        <h1 className='text-3xl font-bold mb-2'>Start a Live Stream</h1>
        <p className="text-gray-400">Share your screen with your audience</p>
      </div>

      <div className="glass rounded-xl p-8 space-y-6">
        {/* Stream Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Stream Title</label>
          <input 
            type="text" 
            value={streamTitle}
            onChange={(e) => setStreamTitle(e.target.value)}
            className='input-field' 
            placeholder='Enter your stream title'
            required
          />
        </div>

        {/* Stream Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description (Optional)</label>
          <textarea 
            value={streamDescription}
            onChange={(e) => setStreamDescription(e.target.value)}
            className='textarea-field h-24' 
            placeholder='Tell viewers what you will be streaming'
          />
        </div>

        {/* Screen Share Preview */}
        <div>
          <label className="block text-sm font-medium mb-2">Screen Preview</label>
          <div className="relative bg-black rounded-lg overflow-hidden border-2 border-gray-800">
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-96 object-contain"
              style={{ display: isCapturing ? 'block' : 'none' }}
            />
            {!isCapturing && (
              <div className="h-96 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <FiMonitor className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No screen being shared</p>
                  <p className="text-gray-500 text-sm mt-2">Click "Start Screen Share" to begin</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4">
          {!isCapturing ? (
            <button
              onClick={startScreenShare}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <FiMonitor className="w-5 h-5" />
              Start Screen Share
            </button>
          ) : (
            <button
              onClick={stopScreenShare}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FiMonitor className="w-5 h-5" />
              Stop Screen Share
            </button>
          )}
        </div>

        {/* Go Live Button */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleStartStream}
            disabled={!isCapturing || !streamTitle.trim() || loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Starting...</span>
              </>
            ) : (
              <>
                <FiVideo className="w-5 h-5" />
                <span>Go Live</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Startstream
