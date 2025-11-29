# YouTube Clone - Complete Full-Stack Application

A modern, feature-rich YouTube clone with a beautiful React frontend and robust Node.js backend.

## 🎯 Features

### Video Platform
- ✅ Video upload with thumbnail
- ✅ HD video playback with controls
- ✅ Video search and filtering
- ✅ Video statistics (views, likes, duration)
- ✅ Watch history tracking
- ✅ Video recommendations

### User Features
- ✅ User registration with avatar & cover image
- ✅ Secure login/logout (JWT authentication)
- ✅ User profiles and channel pages
- ✅ Channel customization
- ✅ Account settings

### Social Features
- ✅ Subscribe/Unsubscribe to channels
- ✅ Like/Unlike videos and comments
- ✅ Comment on videos
- ✅ Comment management
- ✅ Subscriber count
- ✅ Subscription feed

### Playlists & Organization
- ✅ Create and manage playlists
- ✅ Add/remove videos from playlists
- ✅ Playlist viewing
- ✅ Liked videos collection

### Channel Dashboard
- ✅ Channel statistics (views, subscribers, likes)
- ✅ Video management
- ✅ Upload analytics
- ✅ Performance metrics

### UI/UX
- ✅ Modern dark theme
- ✅ Fully responsive design
- ✅ Smooth animations
- ✅ Loading states
- ✅ Toast notifications
- ✅ Intuitive navigation

## 🚀 Quick Start (Windows)

### Option 1: Automated Setup

Simply double-click `start-all.bat` - it will start both backend and frontend servers automatically!

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend**
   ```powershell
   cd backend\chai-backend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Configure environment**
   ```powershell
   Copy .env.example to .env and fill in:
   - MongoDB URI (default: mongodb://localhost:27017)
   - Cloudinary credentials (get from cloudinary.com)
   - JWT secrets (random strings)
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on port 27017

5. **Start backend server**
   ```powershell
   npm run dev
   ```
   Backend will run on `http://localhost:4000`

#### Frontend Setup

1. **Navigate to frontend**
   ```powershell
   cd frontend
   ```

2. **Dependencies are pre-installed**
   If not, run: `npm install`

3. **Start frontend server**
   ```powershell
   npm run dev
   ```
   Frontend will open on `http://localhost:5173`

## 📁 Project Structure

```
youtube/
├── backend/
│   └── chai-backend/           # Node.js + Express backend
│       ├── src/
│       │   ├── controllers/   # Business logic
│       │   ├── models/        # MongoDB schemas
│       │   ├── routes/        # API routes
│       │   ├── middlewares/   # Auth, multer, etc.
│       │   ├── utils/         # Helpers
│       │   └── index.js       # Entry point
│       ├── public/            # Static files
│       ├── package.json
│       └── .env              # Configuration
│
├── frontend/                  # React + TypeScript
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API calls
│   │   ├── store/            # State management
│   │   ├── types/            # TypeScript types
│   │   └── lib/              # Utilities
│   ├── package.json
│   └── vite.config.ts
│
├── start-all.bat             # Start everything
├── README.md                 # This file
└── SETUP.md                  # Detailed setup guide
```

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Media storage
- **Cookie Parser** - Cookie handling
- **CORS** - Cross-origin requests
- **Rate Limiting** - API protection

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Zustand** - State management
- **Axios** - HTTP client
- **React Player** - Video playback
- **React Hot Toast** - Notifications
- **date-fns** - Date formatting

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017
DB_NAME=youtube
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000
```

## 📡 API Endpoints

### Authentication
- `POST /users/register` - Register user
- `POST /users/login` - Login user
- `POST /users/logout` - Logout user
- `GET /users/current-user` - Get current user
- `POST /users/refresh-token` - Refresh tokens

### Videos
- `GET /videos/get-videos` - Get all videos
- `GET /videos/video/:id` - Get video by ID
- `POST /videos/upload-video` - Upload video
- `PATCH /videos/video/:id` - Update video
- `DELETE /videos/video/:id` - Delete video

### Comments
- `GET /comments/:videoId` - Get video comments
- `POST /comments/:videoId` - Add comment
- `PATCH /comments/c/:commentId` - Update comment
- `DELETE /comments/c/:commentId` - Delete comment

### Likes
- `POST /likes/toggle/v/:videoId` - Toggle video like
- `POST /likes/toggle/c/:commentId` - Toggle comment like
- `GET /likes/videos` - Get liked videos

### Subscriptions
- `POST /subscriptions/toggle-subscription/:channelId` - Subscribe/Unsubscribe
- `GET /subscriptions/subscribers/:channelId` - Get subscribers
- `GET /subscriptions/subscribed-channels/:userId` - Get subscriptions

### Playlists
- `POST /playlists/` - Create playlist
- `GET /playlists/user-playlists/:userId` - Get user playlists
- `GET /playlists/:playlistId` - Get playlist
- `POST /playlists/add-video/:playlistId` - Add video
- `DELETE /playlists/:playlistId` - Delete playlist

### Dashboard
- `GET /dashboard/stats` - Get channel stats
- `GET /dashboard/videos` - Get channel videos

## 🎨 UI Pages

- **Home** (`/`) - Video feed
- **Login** (`/login`) - User login
- **Register** (`/register`) - User registration
- **Video Detail** (`/video/:id`) - Watch video
- **Channel** (`/channel/:username`) - User channel
- **My Channel** (`/my-channel`) - Own channel dashboard
- **Upload** (`/upload`) - Upload video
- **Playlist** (`/playlist/:id`) - View playlist
- **History** (`/history`) - Watch history
- **Liked Videos** (`/liked`) - Liked videos
- **Subscriptions** (`/subscriptions`) - Subscribed channels

## 🔧 Development

### Backend Development
```powershell
cd backend\chai-backend
npm run dev    # Runs with nodemon (auto-reload)
```

### Frontend Development
```powershell
cd frontend
npm run dev    # Hot reload enabled
```

### Build for Production
```powershell
# Frontend
cd frontend
npm run build  # Creates optimized build in dist/

# Backend
# Set NODE_ENV=production in .env
```

## 📝 First Time Setup Checklist

- [ ] Install Node.js 18+
- [ ] Install MongoDB
- [ ] Clone/download project
- [ ] Backend: `npm install`
- [ ] Frontend: `npm install` (already done)
- [ ] Create backend `.env` file
- [ ] Configure Cloudinary account
- [ ] Start MongoDB service
- [ ] Run `start-all.bat` or start servers manually

## 🎯 Usage Guide

### For Users

1. **Register** - Create account with avatar
2. **Login** - Sign in to access features
3. **Browse** - Explore videos on home page
4. **Watch** - Click video to watch
5. **Interact** - Like, comment, subscribe
6. **Upload** - Share your videos
7. **Manage** - Track history, playlists

### For Developers

1. **Backend** - Add new routes in `src/routes/`
2. **Frontend** - Add new pages in `src/pages/`
3. **API** - Add services in `src/services/`
4. **Components** - Add UI in `src/components/`
5. **State** - Manage in `src/store/`

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check MONGO_URI in `.env`

**Cloudinary Upload Error**
- Verify Cloudinary credentials
- Check file size limits

### Frontend Issues

**API Connection Error**
- Ensure backend is running on port 4000
- Check VITE_API_URL in `.env`

**Build Errors**
- Delete `node_modules`
- Run `npm install` again
- Clear npm cache

### Common Issues

**Port Already in Use**
- Backend: Change PORT in backend `.env`
- Frontend: Change port in `vite.config.ts`

**CORS Errors**
- Update CORS_ORIGIN in backend `.env`
- Ensure credentials: true in axios config

## 📊 Features Comparison

| Feature | Status |
|---------|--------|
| Video Upload | ✅ |
| Video Playback | ✅ |
| User Auth | ✅ |
| Comments | ✅ |
| Likes | ✅ |
| Subscriptions | ✅ |
| Playlists | ✅ |
| Search | ✅ |
| Watch History | ✅ |
| Channel Stats | ✅ |
| Responsive UI | ✅ |
| Dark Theme | ✅ |

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - Feel free to use for learning and projects!

## 👨‍💻 Credits

- Backend: Based on chai-backend by Pritam Patra
- Frontend: Custom React + TypeScript implementation
- Design: YouTube-inspired UI

---

**Need Help?** Check `SETUP.md` for detailed instructions!

**Ready to start?** Run `start-all.bat` and visit http://localhost:5173
