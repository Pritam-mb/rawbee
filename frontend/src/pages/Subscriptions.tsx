import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { subscriptionService } from '@/services/subscriptionService'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function Subscriptions() {
  const { user } = useAuthStore()
  const [channels, setChannels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSubscriptions()
    }
  }, [user])

  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionService.getSubscribedChannels(user!._id)
      setChannels(response.data)
    } catch (error) {
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ml-64 p-6">
      <h1 className="text-3xl font-bold mb-8">Subscriptions</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {channels.map((subscription) => (
          <Link
            key={subscription._id}
            to={`/channel/${subscription.channel.username}`}
            className="bg-secondary rounded-lg p-6 hover:bg-dark-hover transition"
          >
            <img
              src={subscription.channel.avatar}
              alt={subscription.channel.username}
              className="w-32 h-32 rounded-full mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-center">{subscription.channel.fullname}</h3>
            <p className="text-sm text-gray-400 text-center mt-1">@{subscription.channel.username}</p>
          </Link>
        ))}
      </div>

      {!loading && channels.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">No subscriptions yet</p>
          <p className="text-gray-500 mt-2">Subscribe to channels to see their content here</p>
        </div>
      )}
    </div>
  )
}
