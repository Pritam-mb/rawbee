import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const VideoDetail = lazy(() => import('./pages/VideoDetail'))
const MyChannel = lazy(() => import('./pages/MyChannel'))
const Upload = lazy(() => import('./pages/Upload'))
const Playlist = lazy(() => import('./pages/Playlist'))
const WatchHistory = lazy(() => import('./pages/WatchHistory'))
const LikedVideos = lazy(() => import('./pages/LikedVideos'))
const Subscriptions = lazy(() => import('./pages/Subscriptions'))
const Livestream = lazy(() => import('./pages/Livestream'))
const Startstream = lazy(() => import('./pages/Startstream'))
const LiveStreams = lazy(() => import('./pages/LiveStreams'))
const WatchStream = lazy(() => import('./pages/WatchStream'))

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-xl">Loading application...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/video/:videoId" element={<VideoDetail />} />
            
              <Route element={<ProtectedRoute />}>
              <Route path="/my-channel" element={<MyChannel />} />
              <Route path='/channel/:userId' element={<MyChannel />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/playlist/:playlistId" element={<Playlist />} />
              <Route path="/history" element={<WatchHistory />} />
              <Route path="/liked-videos" element={<LikedVideos />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/livestream" element={<Livestream />} />
              <Route path='/start-Livestream' element={<Startstream/>}></Route>
            </Route>
            <Route path="/live" element={<LiveStreams />} />
            <Route path="/stream/:streamId" element={<WatchStream />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
