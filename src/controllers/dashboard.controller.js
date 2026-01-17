import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import { APIError } from "../utils/ApiError.js";    
import {APIResponse} from "../utils/APIResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid channel ID provided")
    }
    const totalVideos=await Video.countDocuments({owner:channelId})
    const totalSubscribers=await Subscription.countDocuments({channel:channelId})
    const toalLikes=await Like.countDocuments({video:{$in:await Video.find({owner:channelId}).distinct("_id")}})
    const totalViewsAgg=await Video.aggregate([
        {
            $match:{owner:mongoose.Types.ObjectId(channelId)}
        },
        {
            $group:{
                _id:null,
                totalViews:{$sum:"$views"}
            }
        }
    ])
    const totalViews=totalViewsAgg.length>0?totalViewsAgg[0].totalViews:0
    res.status(200).json(new APIResponse(200,"Channel stats fetched successfully",{totalVideos,totalSubscribers,toalLikes,totalViews}))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId} = req.params
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid channel ID provided")
    }
    const videos=await Video.find({owner:channelId}).sort({createdAt:-1})
    res.status(200).json(new APIResponse(200,"Channel videos fetched successfully",videos))
})

export {
    getChannelStats, 
    getChannelVideos
    }