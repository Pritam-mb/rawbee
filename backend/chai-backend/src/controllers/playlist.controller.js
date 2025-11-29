import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import apierror from "../utils/apierror.js"
import {apiresponse} from "../utils/apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    
    if(!name?.trim()){
        throw new apierror("Playlist name is required", 400)
    }
    
    const newPlaylist = await playlist.create({
        name: name.trim(),
        description: description?.trim() || "",
        owner: req.user._id,
        videos: []
    })
    
    return res.status(201).json(new apiresponse(201, newPlaylist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){   
        throw new apierror("Invalid user ID",400)
    }
    const playlists = await playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videoDetails",
                pipeline:[
                    {
                        $project:{
                            videoFile:1,
                            thumbnail:1,
                            title:1,
                            description:1,
                            duration:1,
                            views:1
                        }  
                    }
                ]
            }
        },
        {
            $addFields: {
                totalVideos: { $size: "$videos" },
                videos: "$videoDetails"
            }
        },
        {
            $project: {
                videoDetails: 0
            }
        }
    ])

    return res.status(200).json(new apiresponse(200, playlists, "User playlists fetched"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new apierror("Invalid playlist ID",400)
    }
    
    const result = await playlist.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videoDetails",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                            pipeline:[
                                {   
                                    $project:{
                                        username:1,
                                        avatar:1,
                                        fullname:1
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
                        $project:{
                            videoFile:1,
                            thumbnail:1,
                            title:1,
                            description:1,
                            duration:1,
                            views:1,
                            isPublished:1,
                            createdAt:1,
                            owner:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "playlistOwner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1,
                            fullname:1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalVideos: { $size: "$videos" },
                videos: "$videoDetails",
                owner: { $arrayElemAt: ["$playlistOwner", 0] }
            }
        },
        {
            $project: {
                videoDetails: 0,
                playlistOwner: 0
            }
        }
    ])
    
    if(!result.length){
        throw new apierror("Playlist not found", 404)
    }
    
    return res.status(200).json(new apiresponse(200, result[0], "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new apierror("Invalid playlist ID or video ID",400)
    }

    const Playlist = await playlist.findById(playlistId)
    if(!Playlist){
        throw new apierror("Playlist not found",404)
    }
    if(Playlist.owner.toString() !== req.user._id.toString()){
        throw new apierror("You are not authorized to update this playlist",403)
    }
    
    if(Playlist.videos.includes(videoId)){
        throw new apierror("Video already exists in playlist", 400)
    }
    
    Playlist.videos.push(new mongoose.Types.ObjectId(videoId))
    await Playlist.save()
    return res.status(200).json(new apiresponse(200, Playlist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new apierror("Invalid playlist ID or video ID",400)
    }
    
    const Playlist = await playlist.findById(playlistId)
    if(!Playlist){
        throw new apierror("Playlist not found", 404)
    }
    
    if(Playlist.owner.toString() !== req.user._id.toString()){
        throw new apierror("You are not authorized to update this playlist",403)
    }
    
    Playlist.videos.pull(new mongoose.Types.ObjectId(videoId))
    await Playlist.save()
    return res.status(200).json(new apiresponse(200, Playlist, "Video removed from playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new apierror("Invalid playlist ID",400)
    }
    
    const Playlist = await playlist.findById(playlistId)
    if(!Playlist){
        throw new apierror("Playlist not found", 404)
    }
    
    if(Playlist.owner.toString() !== req.user._id.toString()){
        throw new apierror("You are not authorized to delete this playlist",403)
    }
    
    await playlist.findByIdAndDelete(playlistId)
    return res.status(200).json(new apiresponse(200, {}, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!isValidObjectId(playlistId)){
        throw new apierror("Invalid playlist ID",400)
    }
    
    if(!name?.trim() && !description){
        throw new apierror("Name or description is required", 400)
    }
    
    const Playlist = await playlist.findById(playlistId)
    if(!Playlist){
        throw new apierror("Playlist not found", 404)
    }
    
    if(Playlist.owner.toString() !== req.user._id.toString()){
        throw new apierror("You are not authorized to update this playlist",403)
    }
    
    if(name?.trim()) Playlist.name = name.trim()
    if(description !== undefined) Playlist.description = description.trim()
    
    await Playlist.save()
    return res.status(200).json(new apiresponse(200, Playlist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}