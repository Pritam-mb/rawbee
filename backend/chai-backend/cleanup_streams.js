import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Stream } from './src/models/stream.model.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB.");
    
    // Delete all stuck streams (or all streams for a clean slate)
    const result = await Stream.deleteMany({});
    
    console.log(`🧹 Successfully deleted ${result.deletedCount} streams from the database!`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error connecting to database:", err);
    process.exit(1);
  });
