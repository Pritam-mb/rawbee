 
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import apicache from 'apicache';

const cache = apicache.middleware;
const app = express({});
app.use(cors({     
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
}))

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased for development

})
app.use(limiter); // Apply rate limiting to all requests
app.set("trust proxy", 1); // trust first proxy
// To read JSON data sent in requests (like from Postman or frontend), limit size to 16kb
app.use(express.json({ limit: "16kb" }));

// To read data sent from HTML forms (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// To serve files like images, PDFs, CSS, JS from the "public" folder
app.use(express.static("public"));

// To read cookies sent by the browser
app.use(cookieParser()); // for parsing cookies from request headers

// middlewires are used to handle queries and req like if u hit any ones post of insta then it will check for the token in the cookies and then it will allow u to see that post
import userouter from "./routes/user.route.js"
import videoRouter from "./routes/video.route.js"
import commentRouter from "./routes/comment.route.js"
import likeRouter from "./routes/like.route.js"
import playlistRouter from "./routes/playlist.route.js"
import subscriptionRouter from "./routes/subscription.route.js"
import dashboardRouter from "./routes/dashboard.route.js"
import healthcheckRouter from "./routes/healthcheck.route.js"
import streamRouter from "./routes/stream.routes.js"

//routes
app.use("/users", cache('2 minutes'), userouter)
app.use("/videos", videoRouter)
app.use("/comments", commentRouter)
app.use("/likes", likeRouter)
app.use("/playlists", playlistRouter)
app.use("/subscriptions", subscriptionRouter)
app.use("/dashboard", dashboardRouter)
app.use("/healthcheck", healthcheckRouter)
app.use("/streams", streamRouter)

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [],
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export default app;