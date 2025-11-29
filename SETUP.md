# Setup Instructions

## Complete YouTube Clone Application Setup

This guide will help you set up both the backend and frontend of the YouTube clone application.

## Prerequisites

- Node.js 18 or higher
- MongoDB installed and running
- Git
- A Cloudinary account (for image/video uploads)

## Backend Setup (from GitHub)

### 1. Clone the Backend Repository

```powershell
git clone https://github.com/Pritam-mb/chai-backend.git backend
cd backend
```

### 2. Install Dependencies

```powershell
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend root directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017
DB_NAME=youtube

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Start MongoDB

Make sure MongoDB is running:

```powershell
# If MongoDB is installed as a service, it should be running
# Otherwise, start it manually
mongod
```

### 5. Start Backend Server

```powershell
npm start
```

The backend should now be running on `http://localhost:4000`

## Frontend Setup

### 1. Navigate to Frontend Directory

```powershell
cd d:\youtube\frontend
```

### 2. Dependencies

Dependencies are already installed. If not, run:

```powershell
npm install
```

### 3. Environment Configuration

The `.env` file is already created with:

```env
VITE_API_URL=http://localhost:4000
```

### 4. Start Frontend Development Server

Option 1 - Using npm:
```powershell
npm run dev
```

Option 2 - Using the batch file:
```powershell
.\start.bat
```

The frontend will be available at `http://localhost:3000`

## Verification

### Check Backend

Open your browser and visit:
- `http://localhost:4000/healthcheck` - Should return a health check response

### Check Frontend

Open your browser and visit:
- `http://localhost:3000` - Should show the YouTube clone homepage

## First Time Usage

### 1. Register a New Account

1. Go to `http://localhost:3000/register`
2. Fill in the registration form:
   - Full Name
   - Username
   - Email
   - Password
   - Avatar (required)
   - Cover Image (optional)
3. Click "Sign Up"

### 2. Login

1. Go to `http://localhost:3000/login`
2. Enter your email/username and password
3. Click "Sign In"

### 3. Upload Your First Video

1. Click the upload icon in the navbar
2. Fill in video details:
   - Title
   - Description
   - Select video file
   - Select thumbnail image
3. Click "Upload Video"

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check MongoDB URI in `.env`
- Verify database name

**Cloudinary Upload Error**
- Verify Cloudinary credentials
- Check API limits
- Ensure files are within size limits

**Port Already in Use**
- Change PORT in `.env` to another port (e.g., 5000)
- Update VITE_API_URL in frontend `.env` accordingly

### Frontend Issues

**API Connection Error**
- Ensure backend is running on port 4000
- Check VITE_API_URL in `.env`
- Check CORS settings in backend

**Module Not Found**
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then reinstall

**Build Errors**
- Clear cache: `npm cache clean --force`
- Delete `.vite` folder
- Restart development server

### CORS Issues

If you encounter CORS errors:

1. Check backend `app.js` CORS configuration:
```javascript
app.use(cors({     
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
}))
```

2. Ensure frontend makes requests with credentials:
```javascript
withCredentials: true
```

## Production Deployment

### Backend

1. Set environment to production in `.env`:
```env
NODE_ENV=production
```

2. Use a production MongoDB instance (MongoDB Atlas recommended)

3. Deploy to platforms like:
   - Heroku
   - Railway
   - Render
   - AWS EC2

### Frontend

1. Build the frontend:
```powershell
npm run build
```

2. The `dist` folder will contain production files

3. Deploy to platforms like:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

4. Update environment variables:
```env
VITE_API_URL=https://your-backend-url.com
```

## Additional Notes

### File Upload Limits

- Maximum video file size: Depends on Cloudinary plan
- Maximum image size: 10MB recommended
- Supported video formats: MP4, WebM, OGG
- Supported image formats: JPG, PNG, GIF

### API Rate Limiting

The backend has rate limiting configured:
- 5 requests per 15 minutes per IP
- Adjust in backend `app.js` if needed

### Database Indexes

For better performance, ensure proper indexes:
- User email (unique)
- User username (unique)
- Video owner
- Comment video

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the backend server logs
3. Verify all environment variables
4. Ensure all services (MongoDB, Cloudinary) are accessible
5. Check file permissions

## Development Workflow

1. **Backend Development**
   - Make changes in backend code
   - Server auto-restarts (if using nodemon)
   - Test endpoints with Postman/Thunder Client

2. **Frontend Development**
   - Make changes in frontend code
   - Vite hot-reloads automatically
   - Test in browser at localhost:3000

3. **Testing**
   - Test authentication flow
   - Test video upload
   - Test all CRUD operations
   - Test responsive design

## Features Checklist

- [x] User Registration
- [x] User Login/Logout
- [x] Video Upload
- [x] Video Playback
- [x] Comments
- [x] Likes
- [x] Subscriptions
- [x] Playlists
- [x] Channel Pages
- [x] Search
- [x] Watch History
- [x] Liked Videos
- [x] Responsive Design

## Next Steps

After setup:

1. Explore the application
2. Upload some test videos
3. Create multiple user accounts
4. Test all features
5. Customize the design if needed
6. Add additional features

---

**Happy Coding! 🚀**
