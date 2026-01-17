import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";


const toggleSubscription=asyncHandler(async(req,res)=>{
    const {channelId} = req.params
    const userId=req.user._id
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new APIError(400,"invalid channel ID")
    }
    const existingSubscription=await Subscription.findOne({
        channel:new mongoose.Types.ObjectId(channelId),
        subscriber:userId
    })
    if(existingSubscription){
        await Subscription.deleteOne({
            channel:new mongoose.Types.ObjectId(channelId),
            subscriber:userId
        })
        return res.status(200).json({
            message:"unsubscribed successfully"
        })
    }
    else{
        await Subscription.create({
            channel:new mongoose.Types.ObjectId(channelId),
            subscriber:userId
        })
        return res.status(200).json({
            message:"subscribed successfully"
        })
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const page=Number(req.query.page) || 1;
    const limit=Number(req.query.limit) || 10;
    const skip=(page-1)*limit;
    const subscribers=await Subscription.aggregate([
        {
            $match:{channel:new mongoose.Types.ObjectId(channelId)}
        },
          {  $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriberDetails"
            }
        },{
            $unwind:"$subscriberDetails"
            
        },
        {$skip:skip},
        {$limit:limit}
        ,{
            $project:{
                _id:0,
                subscriberId:"$subscriberDetails._id",
                name:"$subscriberDetails.name",
                email:"$subscriberDetails.email",
                avatar:"$subscriberDetails.avatar"
            }
        }
        
    ])
    const totalSubscribers=await Subscription.countDocuments({
            channel:channelId
        })

    return res.status(200).json(new APIResponse(200,"Channel subscribers details fetched ",{
        page,
        limit,
        totalPages:Math.ceil(totalSubscribers/limit),
        totalSubscribers,
        subscribers,
    }))
    
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    //pagination requirediment
    const page=Number(req.query.page)||1;
    const limit=Number(req.query.limit)||10;
    const skip=(page-1)*limit;
    const subscribedChannels=await Subscription.aggregate([
        {
            $match:{subscriber:new mongoose.Types.ObjectId(subscriberId)}
        },{
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"subscriberDetails"
            }

        },{
            $unwind:"$subscriberDetails"
        },{
            $skip:skip
        },{
            $limit:limit
        },{
            $project:{
                _id:0,
                channelId:"$channel",
                name:"$subscriberDetails.name",
                email:"$subscriberDetails.email",
                avatar:"$subscriberDetails.avatar"
            }
        }
    ])
    const totalSubscribedChannels=await Subscription.countDocuments({
        subscriber:subscriberId
    })
    return res.status(200).json(new APIResponse(200,"Subscribered channels fetched",{
        page,
        limit,
        totalPages:Math.ceil(totalSubscribedChannels/limit),
        totalSubscribedChannels,
        subscribedChannels
    }))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}