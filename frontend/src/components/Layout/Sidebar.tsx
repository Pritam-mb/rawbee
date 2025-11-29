import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiTrendingUp, FiClock, FiThumbsUp, FiList, FiUsers } from 'react-icons/fi'
import { useAuthStore } from '@/store/authStore'

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuthStore()

  const menuItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiTrendingUp, label: 'Trending', path: '/trending' },
    { icon: FiUsers, label: 'Subscriptions', path: '/subscriptions', protected: true },
  ]

  const libraryItems = [
    { icon: FiClock, label: 'History', path: '/history', protected: true },
    { icon: FiThumbsUp, label: 'Liked Videos', path: '/liked', protected: true },
    { icon: FiList, label: 'Playlists', path: '/playlists', protected: true },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-dark border-r border-gray-800 overflow-y-auto">
      <div className="py-2">
        {/* Main Menu */}
        <div className="mb-4">
          {menuItems.map((item) => {
            if (item.protected && !user) return null
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 hover:bg-dark-hover transition ${
                  isActive(item.path) ? 'bg-dark-hover border-l-4 border-primary' : ''
                }`}
              >
                <Icon className="w-6 h-6 mr-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Library Section */}
        {user && (
          <>
            <hr className="border-gray-800 my-2" />
            <div className="px-6 py-2 text-sm text-gray-400 font-semibold">Library</div>
            <div>
              {libraryItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-6 py-3 hover:bg-dark-hover transition ${
                      isActive(item.path) ? 'bg-dark-hover border-l-4 border-primary' : ''
                    }`}
                  >
                    <Icon className="w-6 h-6 mr-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
