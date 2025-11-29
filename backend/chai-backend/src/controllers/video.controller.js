import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiresponse} from "../utils/apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
// import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {uploadCloudinary} from "../utils/cloudinary.js"
import e from "express"
import apierror from "../utils/apierror.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const pipeline = []
 // any keyword
    if(query){
        pipeline.push({
            $match: {
                $or: [
                    {title: {$regex: query, $options: "i"}},
                    {description: {$regex: query, $options: "i"}}
                ]
            }
        });
    }

    //any specific user videos
    if(userId && isValidObjectId(userId)){
        pipeline.push({
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        })
    }

    const sortOrder = sortType === "desc" ? -1 : 1
    // default sort field to createdAt if sortBy is not provided
    pipeline.push({
        $sort: {
            [sortBy || "createdAt"]: sortOrder
        }
    })

    pipeline.push({
         $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
            pipeline:[
                {
                    $project: {
                        username: 1,
                        avatar: 1,
                        fullname: 1
                    }
                }
            ]
        }
});
   pipeline.push({
        $addFields: {
            owner: { $arrayElemAt: ["$ownerDetails", 0] } // to convert array to object
        }
    });
    pipeline.push({ $project: { ownerDetails: 0 } }); // remove ownerDetails field
    
    //this portion is just to calculate the current page data
    const pageno = parseInt(page, 10) || 1 //here 10 means decimal base 0-9
    const limitno = parseInt(limit, 10) || 10 //default limit 10
    const skip=(pageno-1)*limitno
    pipeline.push({
        $skip: skip
    })
    pipeline.push({
        $limit: limitno
    })
    const videos = await Video.aggregate(pipeline)

    // now we need total vide no so we exclude skip and limit
     const totalPipeline = [...pipeline.slice(0, pipeline.length - 2)]; // remove skip/limit
    totalPipeline.push({ $count: "total" });
    const totalResult = await Video.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    return res.status(200).json(
        new apiresponse(200, {
            videos,
            pagination: {
                total,
                page: pageno,
                limit: limitno,
                pages: Math.ceil(total / limitno)
            }
        }, "Videos fetched successfully")
    )
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if (!(title && description)) {
        throw new apierror("Title and Description are required", 400)
    }
    const video = req.files?.videoFile[0]?.path

    if (!(video)) {
        throw new apierror("Video file is required", 400)
    }
    let thumbnail;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {  //check if cover image exist by checking array length
        thumbnail = req.files.thumbnail[0].path
    }

    const videopath = await uploadCloudinary(video)
    const thumbnailpath = await uploadCloudinary(thumbnail)

    if(!videopath){
        throw new apierror("Failed to upload video", 500)
    }

    // Get duration from Cloudinary response or set default
    const duration = videopath.duration || 0

    const newvideo = await Video.create({
        videoFile: videopath.url || videopath,
        thumbnail: thumbnailpath?.url || thumbnailpath || "",
        title,
        description,
        duration,
        owner: req.user._id
    })
    
    return res.status(201).json(new apiresponse(201, newvideo, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new apierror("Invalid video ID", 400)
    }
    
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
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
    ])
    
    if(!video || video.length === 0){
        throw new apierror("Video not found", 404)
    }
    
    return res.status(200).json(new apiresponse(200, video[0], "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    //TODO: update video details like title, description, thumbnail
    if(!(isValidObjectId(videoId))){
        throw new Error("Invalid video ID")
    }
    const video = await Video.findById(videoId) 
    if(!video){
        throw new Error("Video not found")
    }
    if(video.owner.toString() === req.user._id.toString()){
        const {title,description} = req.body
        const thumbnailFile = req.file?.path
        if(!thumbnailFile && req.file){
            throw new Error("Thumbnail file is invalid")
        }
        if(!(title || description)){
            throw new Error("At least one field is required to update")
        }
        video.title = title || video.title
        video.description = description || video.description
        const thumbnailpath = await uploadCloudinary(thumbnailFile)

        if(!thumbnailpath.url){
            throw new Error("Failed to upload thumbnail")
        }
        video.thumbnail = thumbnailpath.url || video.thumbnail
        await video.save()
        return res.status(200).json(new apiresponse(200, video, "Video updated successfully"))

    }
    else{
        throw new Error("You are not authorized to update this video")
    }

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new Error("Invalid video ID")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new Error("Video not found")
    }
    if(video.owner.toString() !== req.user._id.toString()){
        throw new apierror("You are not authorized to delete this video",403)}
    await Video.findByIdAndDelete(videoId)
    return res.status(200).json(new apiresponse(200, null, "Video deleted successfully"))
    
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new Error("Invalid video ID")
    }
    const video = await Video.findById(videoId)
    if(video.owner.toString() !== req.video._id.toString()){
        throw new apierror("You are not authorized to update this video",403)
    }
    video.ispublished = !video.ispublished
    await video.save({validatebeforeSave: false})
    return res.status(200).json(new apiresponse(200, video, "Video publish status updated successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}