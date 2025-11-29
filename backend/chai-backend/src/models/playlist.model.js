import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    videos:[
        { type: mongoose.Schema.Types.ObjectId,
            ref: "Videos"
        }
    ],
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{
    timestamps: true
})

export const Playlist = mongoose.model("Playlist",playlistSchema);