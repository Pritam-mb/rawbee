import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FiSearch, FiVideo, FiBell, FiUser, FiLogOut, FiSettings } from 'react-icons/fi'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${searchQuery}`)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      logout()
      toast.success('Logged out successfully')
      navigate('/')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-800/50 shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img 
              src="https://img.freepik.com/premium-vector/black-white-circle-logo-with-p-middle_853558-1773.jpg" 
              alt="Logo" 
              className="w-10 h-10 rounded-full object-cover group-hover:scale-110 transition-transform" 
            />
            <span className="text-2xl font-bold gradient-text hidden sm:block">
              Rawbee
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 sm:mx-8">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-full pl-12 pr-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-smooth group-hover:border-gray-700"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Upload Button */}
                <Link
                  to="/upload"
                  className="hidden sm:flex items-center space-x-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 px-4 py-2 rounded-lg transition-smooth border border-red-500/20"
                >
                  <FiVideo className="w-4 h-4" />
                  <span className="font-medium">Upload</span>
                </Link>
                  <Link
                  to="/start-livestream"
                  className="hidden sm:flex items-center space-x-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 px-4 py-2 rounded-lg transition-smooth border border-red-500/20"
                >
                  <FiVideo className="w-4 h-4" />
                  <span className="font-medium">stream</span>
                </Link>
                

                {/* Notifications */}
                <button className="relative p-2.5 hover:bg-gray-800/50 rounded-lg transition-smooth">
                  <FiBell className="w-5 h-5 text-gray-400 hover:text-gray-200" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 hover:bg-gray-800/50 px-2 py-1.5 rounded-lg transition-smooth"
                  >
                    <img
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.username}
                      className="w-8 h-8 avatar"
                    />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 glass rounded-xl shadow-2xl border border-gray-800/50 animate-slideDown">
                      <div className="p-4 border-b border-gray-800/50">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar || '/default-avatar.png'}
                            alt={user.username}
                            className="w-12 h-12 avatar"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{user.fullname}</p>
                            <p className="text-sm text-gray-400 truncate">@{user.username}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <Link
                          to="/my-channel"
                          className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-800/50 rounded-lg transition-smooth text-gray-300 hover:text-white"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FiUser className="w-5 h-5" />
                          <span>Your Channel</span>
                        </Link>
                        
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-800/50 rounded-lg transition-smooth text-gray-300 hover:text-white"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FiSettings className="w-5 h-5" />
                          <span>Settings</span>
                        </Link>
                        
                        <button
                          onClick={() => {
                            handleLogout()
                            setShowUserMenu(false)
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-500/10 rounded-lg transition-smooth text-red-500"
                        >
                          <FiLogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 btn-primary"
              >
                <FiUser className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
