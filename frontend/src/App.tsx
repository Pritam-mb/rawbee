import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VideoDetail from './pages/VideoDetail'
import MyChannel from './pages/MyChannel'
import Upload from './pages/Upload'
import Playlist from './pages/Playlist'
import WatchHistory from './pages/WatchHistory'
import LikedVideos from './pages/LikedVideos'
import Subscriptions from './pages/Subscriptions'
import Livestream from './pages/Livestream'
import Startstream from './pages/Startstream'

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
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
        </Route>
      </Routes>
    </Router>
  )
}

export default App
