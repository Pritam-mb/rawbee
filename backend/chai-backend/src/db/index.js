import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"; // go up one folder

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    if (uri.includes('?')) {
      // Replace the slash before the query mark if it exists
      uri = uri.replace(/\/?\?/, `/${DB_NAME}?`);
    } else {
      uri = uri.endsWith('/') ? `${uri}${DB_NAME}` : `${uri}/${DB_NAME}`;
    }
    const connectionInstance = await mongoose.connect(uri, {
      family: 4
    });
    console.log(`✅ Database connected successfully. Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
