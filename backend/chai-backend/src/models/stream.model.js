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
      ref: "Users",
      required: true,
    },
    // Live room participants with WebRTC
    participants: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: "Users",
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      isMuted: {
        type: Boolean,
        default: false,
      }
    }],
    roomtype: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    "max-participants": {
      type: Number,
      default: 6
    },
    roomstatus:{
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    // Live room type: regular stream vs screen-share-voice
    streamType: {
      type: String,
      enum: ["regular", "screen-share-voice"],
      default: "regular",
    },
    isLive: {
      type: Boolean,
      default: true,
    },
    viewers: [{
      type: Schema.Types.ObjectId,
      ref: "Users",
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
