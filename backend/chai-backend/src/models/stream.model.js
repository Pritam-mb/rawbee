import mongoose, { Schema } from "mongoose";

const streamSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isLive: {
      type: Boolean,
      default: true,
    },
    viewers: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    viewerCount: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    thumbnail: {
      type: String, // cloudinary url
    },
    chatEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Stream = mongoose.model("Stream", streamSchema);
