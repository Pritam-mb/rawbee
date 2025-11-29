import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { subscription } from "../models/subscription.model.js"
import apierror from "../utils/apierror.js"
import {apiresponse} from "../utils/apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new apierror("Invalid channel ID",400)
    }
    const subcriber = await subscription.findOne(
        {
            subscriber: req.user._id,
            channel: channelId
        }
    )
    if(!subcriber){
        await subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
        return res.status(200).json(new ApiResponse("Subscribed successfully",200,null))}
        else{
            await subscription.findByIdAndDelete(subcriber._id)
            return res.status(200).json(new ApiResponse("Unsubscribed successfully",200,null))
        }


    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new apierror("Invalid channel ID",400)
    }
    const subscriber = await subscription.find({channel : channelId}).populate("subscriber","username avatar email fullname ")
    return res.status(200).json(
        new ApiResponse("Subscriber list fetched successfully",200,subscriber)
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new apierror("Invalid subscriber ID",400)
    }
    const channel = await subscription.find({subscriber : subscriberId}).populate("channel","username avatar email fullname ")
//    const channel = await subscription.aggregate([
//     {$match:{
//         subscriber: new mongoose.Types.ObjectId(subscriberId)
//     }},

//             {
//                 $lookup:{
//                     from:"users",
//                     localField:"channel",
//                     foreignField:"_id", 
//                     as:"channelInfo",
//                     pipeline:[
//                         {
//                             $project:{
//                                 username:1,
//                                 avatar:1,
//                                 fullname:1,
//                                 email:1
//                             }
//                         }
//                     ]
//                 }
//             }
        
    
//    ])
    return res.status(200).json(
        new ApiResponse("Subscribed channels fetched successfully",200,channel)
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}