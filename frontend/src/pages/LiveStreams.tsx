import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiRadio, FiUsers } from 'react-icons/fi'
import { streamService } from '@/services/streamService'
import toast from 'react-hot-toast'
import { timeAgo } from '@/utils/dateUtils'

export default function LiveStreams() {
  const [streams, setStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreams()
  }, [])

  const fetchStreams = async () => {
    try {
      setLoading(true)
      const response = await streamService.getLiveStreams()
      setStreams(response.data)
    } catch (error: any) {
      console.error('Failed to fetch live streams:', error)
      toast.error('Failed to load live streams')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <FiRadio className="w-8 h-8 text-red-500 animate-pulse" />
        <h1 className="text-3xl font-bold text-white">Live Now</h1>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-3">
              <div className="w-full aspect-video bg-gray-800 rounded-xl"></div>
              <div className="flex gap-3 mt-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 shrink-0"></div>
                <div className="flex flex-col gap-2 w-full">
                  <div className="w-[90%] h-4 bg-gray-800 rounded"></div>
                  <div className="w-[60%] h-4 bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : streams.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800 mt-10">
          <FiRadio className="w-16 h-16 mx-auto mb-4 text-gray-700" />
          <p className="text-gray-400 text-xl font-medium">No one is live right now</p>
          <p className="text-gray-500 text-sm mt-2">Check back later or start your own stream!</p>
          <Link to="/start-Livestream" className="inline-block mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
            Start Streaming
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {streams.map((stream) => (
            <Link key={stream._id} to={`/stream/${stream._id}`} className="group cursor-pointer flex flex-col gap-3">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-800 border border-gray-700 group-hover:border-red-500 transition-colors">
                {stream.thumbnail ? (
                  <img src={stream.thumbnail} alt={stream.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <FiRadio className="w-12 h-12 text-gray-700" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                  <FiUsers className="w-3 h-3 text-red-400" />
                  {stream.viewerCount}
                </div>
              </div>

              <div className="flex gap-3 mt-2 pr-6">
                <img 
                  src={stream.host.avatar || 'https://via.placeholder.com/150'} 
                  alt={stream.host.username} 
                  className="w-9 h-9 rounded-full object-cover shrink-0 bg-gray-800 border border-gray-700"
                />
                <div className="flex flex-col overflow-hidden">
                  <h3 className="text-white text-base font-medium line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
                    {stream.title}
                  </h3>
                  <span className="text-gray-400 text-sm mt-1 flex items-center hover:text-white transition-colors">
                    {stream.host.username}
                  </span>
                  <span className="text-gray-500 text-xs mt-0.5">
                    Started {stream.startedAt ? timeAgo(stream.startedAt) : 'recently'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
