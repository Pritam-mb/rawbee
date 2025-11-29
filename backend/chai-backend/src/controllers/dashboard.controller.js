import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import apierror from "../utils/apierror.js"
import {apiresponse} from "../utils/apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id // Get stats for logged-in user's channel

    // Get total videos
    const totalVideos = await Video.countDocuments({ owner: channelId })

    // Get total subscribers
    const totalSubscribers = await subscription.countDocuments({ channel: channelId })

    // Get total views and total likes using aggregation
    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$likes" } }
            }
        }
    ])

    const stats = {
        totalVideos,
        totalSubscribers,
        totalViews: videoStats[0]?.totalViews || 0,
        totalLikes: videoStats[0]?.totalLikes || 0
    }

    return res
        .status(200)
        .json(new apiresponse(200, stats, "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id // Get videos for logged-in user's channel

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                totalLikes: { $size: "$likes" }
            }
        },
        {
            $project: {
                likes: 0 // Remove likes array, keep only count
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    return res
        .status(200)
        .json(new apiresponse(200, {
            count: videos.length,
            videos
        }, "Channel videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
}
