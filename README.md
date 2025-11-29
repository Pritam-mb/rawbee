# YouTube Clone - Complete Application

This is a full-stack YouTube clone application with a beautiful, modern frontend built with React and TypeScript, integrated with a Node.js backend.

## 🚀 Quick Start

### Backend Setup
1. Navigate to the backend directory (if you have it cloned from https://github.com/Pritam-mb/chai-backend.git)
2. Install dependencies: `npm install`
3. Create `.env` file with required environment variables
4. Start the server: `npm start` (should run on port 4000)

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Dependencies are already installed
3. Start the development server: `npm run dev` or run `start.bat`
4. Open http://localhost:3000 in your browser

## 📁 Project Structure

```
youtube/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Layout/     # Navbar, Sidebar, Layout
│   │   │   ├── VideoCard.tsx
│   │   │   ├── VideoSkeleton.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/          # Route pages
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── VideoDetail.tsx
│   │   │   ├── Channel.tsx
│   │   │   ├── MyChannel.tsx
│   │   │   ├── Upload.tsx
│   │   │   ├── Playlist.tsx
│   │   │   ├── WatchHistory.tsx
│   │   │   ├── LikedVideos.tsx
│   │   │   └── Subscriptions.tsx
│   │   ├── services/       # API integration
│   │   │   ├── authService.ts
│   │   │   ├── videoService.ts
│   │   │   ├── commentService.ts
│   │   │   ├── likeService.ts
│   │   │   ├── subscriptionService.ts
│   │   │   ├── playlistService.ts
│   │   │   └── userService.ts
│   │   ├── store/          # State management (Zustand)
│   │   ├── types/          # TypeScript definitions
│   │   ├── lib/            # Utilities (axios config)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
```

## ✨ Features

### Authentication & User Management
- ✅ User registration with avatar and cover image upload
- ✅ Login/Logout with JWT authentication
- ✅ Protected routes for authenticated users
- ✅ Token refresh mechanism
- ✅ User profile management

### Video Features
- ✅ Video upload with thumbnail
- ✅ Video playback with React Player
- ✅ Video listing with pagination
- ✅ Video search functionality
- ✅ Video details page
- ✅ Video statistics (views, likes, duration)
- ✅ Video management (update, delete)

### Social Features
- ✅ Subscribe/Unsubscribe to channels
- ✅ Like/Unlike videos
- ✅ Comment system (add, update, delete)
- ✅ Like/Unlike comments
- ✅ Watch history tracking
- ✅ Liked videos collection

### Channel Features
- ✅ Channel profile pages
- ✅ Channel statistics dashboard
- ✅ Subscriber count
- ✅ Channel videos grid
- ✅ My Channel page with analytics

### Playlist Features
- ✅ Create playlists
- ✅ Add/Remove videos from playlists
- ✅ View playlist details
- ✅ Manage playlists

### UI/UX Features
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark theme optimized for video viewing
- ✅ Beautiful gradient backgrounds
- ✅ Smooth animations and transitions
- ✅ Loading skeletons
- ✅ Toast notifications
- ✅ Sidebar navigation
- ✅ Search bar in navbar
- ✅ User dropdown menu

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS
- **React Router DOM** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **React Player** - Video playback
- **React Hot Toast** - Notifications
- **React Icons** - Icon library
- **date-fns** - Date formatting

### Backend Integration
- RESTful API integration
- JWT authentication
- File upload (videos, images)
- Automatic token refresh
- Error handling

## 📋 API Endpoints Used

### Authentication
- POST `/users/register` - Register new user
- POST `/users/login` - Login user
- POST `/users/logout` - Logout user
- POST `/users/refresh-token` - Refresh access token
- GET `/users/current-user` - Get current user
- PATCH `/users/update-user` - Update user details
- PATCH `/users/update-avatar` - Update avatar
- POST `/users/change-password` - Change password

### Videos
- GET `/videos/get-videos` - Get all videos
- GET `/videos/video/:videoId` - Get video by ID
- POST `/videos/upload-video` - Upload video
- PATCH `/videos/video/:videoId` - Update video
- DELETE `/videos/video/:videoId` - Delete video
- PATCH `/videos/video/toggle-publish/:videoId` - Toggle publish status

### Comments
- GET `/comments/:videoId` - Get video comments
- POST `/comments/:videoId` - Add comment
- PATCH `/comments/c/:commentId` - Update comment
- DELETE `/comments/c/:commentId` - Delete comment

### Likes
- POST `/likes/toggle/v/:videoId` - Toggle video like
- POST `/likes/toggle/c/:commentId` - Toggle comment like
- GET `/likes/videos` - Get liked videos

### Subscriptions
- POST `/subscriptions/toggle-subscription/:channelId` - Toggle subscription
- GET `/subscriptions/subscribers/:channelId` - Get channel subscribers
- GET `/subscriptions/subscribed-channels/:subscriberId` - Get subscribed channels

### Playlists
- POST `/playlists/` - Create playlist
- GET `/playlists/user-playlists/:userId` - Get user playlists
- GET `/playlists/:playlistId` - Get playlist by ID
- POST `/playlists/add-video/:playlistId` - Add video to playlist
- POST `/playlists/remove-video/:playlistId` - Remove video from playlist
- DELETE `/playlists/:playlistId` - Delete playlist
- PUT `/playlists/:playlistId` - Update playlist

### Dashboard
- GET `/dashboard/stats` - Get channel statistics
- GET `/dashboard/videos` - Get channel videos

### User
- GET `/users/channel/:username` - Get user channel profile
- GET `/users/watch-history` - Get watch history

## 🎨 Design Highlights

- **Color Scheme**: Dark theme with YouTube-inspired red primary color
- **Typography**: Clean, readable fonts with proper hierarchy
- **Layout**: Responsive grid system with sidebar navigation
- **Components**: Reusable, modular component architecture
- **Animations**: Smooth hover effects and transitions
- **Icons**: Consistent icon usage from React Icons
- **Forms**: Beautiful form inputs with proper validation
- **Cards**: Modern video cards with thumbnail previews

## 🔐 Security Features

- JWT token authentication
- Secure cookie handling
- Protected routes
- Token refresh mechanism
- Automatic logout on token expiry
- CORS configuration

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints for all device sizes
- Adaptive layouts
- Touch-friendly interfaces
- Optimized images

## 🚀 Performance Optimizations

- Code splitting
- Lazy loading
- Image optimization
- Efficient state management
- Memoization where needed
- Optimized re-renders

## 📝 Usage Guide

### For Users
1. **Register**: Create account with avatar
2. **Login**: Sign in to access features
3. **Browse**: Explore videos on home page
4. **Watch**: Click any video to watch
5. **Interact**: Like, comment, subscribe
6. **Upload**: Share your own videos
7. **Manage**: Track history, liked videos, subscriptions

### For Developers
1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Start development server
5. Build for production: `npm run build`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

## 👨‍💻 Author

Built with ❤️ for learning and demonstration purposes.

---

**Note**: Make sure the backend server is running before starting the frontend application.
