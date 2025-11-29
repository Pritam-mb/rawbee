import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import apierror from "../utils/apierror.js"
import {apiresponse} from "../utils/apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(isValidObjectId(videoId) === false){
        throw new ApiError("Invalid video ID", 400)
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError("Video not found", 404)
    }
    const existlike = await Like.findOne({
        user: req.user._id,
        likeable: videoId,
        onModel: "Video"
    })

    if(existlike){
        await Like.findByIdAndDelete(existlike._id)
        return res.status(200).json(new ApiResponse("Video unliked successfully",200,null))
    }
    await Like.create({
        video: videoId,
        likedby: req.user._id
    })
    return res.status(200).json(new ApiResponse("Video liked successfully",200,null))   

    })
    //TODO: toggle like on video


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(isValidObjectId(commentId) === false){
        throw new ApiError("Invalid comment ID", 400)
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError("Comment not found", 404)
    }

    const commentlike = await Like.findOne({
        comment: commentId,
        likedby: req.user._id
    })
    if(commentlike){
        await Like.findByIdAndDelete(commentlike._id)
        return res.status(200).json(new ApiResponse("Comment unliked successfully",200,null))
    }
    await Like.create({
        comment: commentId,
        likedby: req.user._id
    })
    return res.status(200).json(new ApiResponse("Comment liked successfully",200,null))
    //TODO: toggle like on comment

})



// ...existing code...
const getLikedVideos = asyncHandler(async (req, res) => {
    const likedvideos = await Like.aggregate([
        {
            $match:{
                likedby: new mongoose.Types.ObjectId(req.user._id),
                video: {$exists: true}
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videodetails",  // lowercase here
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullname: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $arrayElemAt: ["$ownerDetails", 0] }
                        }
                    },
                    {
                        $project: {
                            ownerDetails: 0
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                video: { $arrayElemAt: ["$videodetails", 0] }  // match lowercase
            }
        },
        {
            $project: {
                videodetails: 0  // match lowercase
            }
        }
    ])
    
    return res.status(200).json(
        new apiresponse(200, {
            count: likedvideos.length,
            likedvideos
        })
    )
})
// ...existing code...


export {
    toggleCommentLike,
    // toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}