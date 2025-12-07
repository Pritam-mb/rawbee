// Load environment variables
import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // .env is in the project root
console.log("🔧 Environment loaded. PORT:", process.env.PORT);
console.log("🔧 MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");
// const a = require(FileSystem)
// Import dependencies
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import app from "./app.js";
import { createServer } from "http";
import { initializeSocket } from "./socket.js";

console.log("🔧 Starting database connection...");

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);
console.log("✅ Socket.io initialized");

connectDB()
.then(()=>{
    httpServer.listen(process.env.PORT || 8000, () => {
        console.log(`🚀 Server running on port ${process.env.PORT || 8000}`);
        console.log(`🔌 Socket.io ready for connections`);
      });
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err.message);
  throw err;
});






// import express from "express";

// // Initialize express app
// const app = express();

// // Debug check (optional, remove later)
// console.log("MONGO_URI:", process.env.MONGO_URI);
// console.log("PORT:", process.env.PORT);

// // Self-invoking async function to connect DB and start server
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
//     console.log("✅ MongoDB connected successfully");

//     app.on("error", (err) => {
//       console.error("❌ Express server error:", err.message);
//     });

//     app.listen(process.env.PORT || 8000, () => {
//       console.log(`🚀 Server running on port ${process.env.PORT || 8000}`);
//     });
//   } catch (error) {
//     console.error("❌ MongoDB connection error:", error.message);
//     throw error;
//   }
// })();
