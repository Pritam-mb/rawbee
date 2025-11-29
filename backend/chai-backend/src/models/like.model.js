import mongoose from "mongoose";

const likeschema = new mongoose.Schema({
    comment:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    },
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    likedby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
     createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },

},
{
    timestamps: true
})

export const Like = mongoose.model("Like",likeschema);