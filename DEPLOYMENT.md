# Render Deployment Guide

This guide will help you deploy your YouTube clone project to Render's free tier.

## 📋 Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com) (free)
3. **MongoDB Atlas Account** - For your database (free tier available)
4. **Cloudinary Account** - For media uploads (free tier available)

## 🗄️ Step 1: Set Up MongoDB Atlas (Free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up
2. Create a new **FREE** cluster (M0 Sandbox)
3. Create a database user:
   - Username: `youtubeuser` (or your choice)
   - Password: Generate a secure password
4. **Whitelist IP**: Go to Network Access → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
5. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://user:password@cluster.mongodb.net/`)
   - Replace `<password>` with your database password
   - Add `/youtube` at the end (or your DB name)

Example: `mongodb+srv://youtubeuser:mypassword@cluster0.abc123.mongodb.net/youtube`

## ☁️ Step 2: Set Up Cloudinary (Free)

1. Go to [cloudinary.com](https://cloudinary.com) and sign up
2. Go to Dashboard
3. Copy these three values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## 🚀 Step 3: Push Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

**Note:** Make sure to commit and push the updated `render.yaml` file!

## 🎯 Step 4: Deploy Backend on Render

### Using Blueprint (Recommended)

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and show the backend service
5. **IMPORTANT**: Set these environment variables before deploying:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `CLOUDINARY_CLOUD_NAME`: From Cloudinary
   - `CLOUDINARY_API_KEY`: From Cloudinary
   - `CLOUDINARY_API_SECRET`: From Cloudinary
   - `CORS_ORIGIN`: Leave empty for now (we'll add frontend URL later)

6. Click **"Apply"** to create the backend service
7. Wait for deployment (5-10 minutes first time)
8. **Copy your backend URL** (e.g., `https://youtube-backend-xyz.onrender.com`)

### Manual Deployment (Alternative)
1. Go to Render Dashboard → **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `youtube-backend`
   - **Region**: Oregon (or closest to you)
   - **Root Directory**: `backend/chai-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=your_mongodb_atlas_connection_string
   DB_NAME=youtube
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ACCESS_TOKEN_SECRET=your_random_secret_here_at_least_32_chars
   REFRESH_TOKEN_SECRET=another_random_secret_here_at_least_32_chars
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_EXPIRY=10d
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   ```

   **Generate Random Secrets:**
   Run in your terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes first time)
7. **Copy your backend URL** (e.g., `https://youtube-backend-xyz.onrender.com`)

## 🌐 Step 5: Deploy Frontend on Render

**Deploy Frontend as Static Site:**
1. Go to Render Dashboard → **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `youtube-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://youtube-backend-xyz.onrender.com
   ```
   (Use your actual backend URL from step 7 above)

5. Click **"Create Static Site"**
6. Wait for deployment (3-5 minutes)
7. **Copy your frontend URL** (e.g., `https://youtube-frontend-xyz.onrender.com`)

## 🔄 Step 6: Update CORS_ORIGIN

1. Go to your **backend service** on Render
2. Go to **Environment**
3. Update `CORS_ORIGIN` to your frontend URL (e.g., `https://youtube-frontend-xyz.onrender.com`)
4. Click **"Save Changes"**
5. Backend will automatically redeploy

## ✅ Step 7: Test Your Deployment

1. Open your frontend URL in a browser
2. Try to register/login
3. Upload a video
4. Test live streaming features

## ⚠️ Important Notes for Free Tier

### Cold Starts
- **Services sleep after 15 minutes of inactivity**
- First request after sleep takes **30-60 seconds** to wake up
- This is normal for free tier

### Workarounds:
1. **UptimeRobot**: Set up a free ping service to keep backend awake
2. **Cron Jobs**: Use Render Cron Jobs to ping your API every 14 minutes
3. **Upgrade**: Pay $7/month to keep backend always active

### Storage Limitations
- **Temporary file storage** (`public/temp/`) is cleared on each deploy
- Files uploaded via Multer before Cloudinary upload may be lost
- **Solution**: Keep your current setup - files go to Cloudinary permanently

## 🐛 Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Frontend can't connect to backend
- Verify `VITE_API_URL` matches your backend URL (with https://)
- Check `CORS_ORIGIN` in backend environment variables
- Look for errors in browser console (F12)

### Video uploads fail
- Verify Cloudinary credentials are correct
- Check backend logs for errors
- Ensure file size is within Cloudinary free tier limits (10MB per image, 100MB per video)

### Socket.io connection fails
- Ensure backend URL in frontend is correct
- Check that backend is not sleeping (cold start issue)
- Look for CORS errors in browser console

## 🎉 Success!

Your YouTube clone is now live on Render's free tier!

**Share your URLs:**
- Frontend: `https://youtube-frontend-xyz.onrender.com`
- Backend API: `https://youtube-backend-xyz.onrender.com`

## 📈 Future Upgrades

When you're ready to go production:
- **Render Paid Plan** ($7-25/month): No cold starts, more resources
- **Custom Domain**: Add your own domain name
- **CDN**: Use Cloudflare for faster global access
- **Database Backup**: Enable MongoDB Atlas backups
- **Monitoring**: Set up error tracking (Sentry, LogRocket)

## 🆘 Need Help?

- Check Render docs: [render.com/docs](https://render.com/docs)
- MongoDB Atlas docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Open an issue in your repository
