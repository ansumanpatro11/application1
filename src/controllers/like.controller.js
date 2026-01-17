import mongoose, {isValidObjectId} from 'mongoose';
import {Like} from '../models/like.model.js';
import { APIResponse } from '../utils/APIResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { APIError } from '../utils/ApiError.js';


const toggleVideoLike=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const userId=req.user._id;
    if(userId.toString()===undefined || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new APIError(400,"Invalid data provided");
    }
    const exisitingLike=await Like.findOne({likedBy:userId,video:videoId})
    if(exisitingLike){
        await exisitingLike.deleteOne();
        return res.status(200).json(new APIResponse(200,"Video unliked successfully",null));
    }
    const newLike=await Like.create({
        likedBy:userId,
        video:videoId,
    })
    await newLike.save()
    return res.status(200).json(new APIResponse(200,"Video liked successfully",newLike));

})

const toggleCommentLike=asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    const userId=req.user._id
    if(userId.toString()===undefined || !mongoose.Types.ObjectId.isValid(commentId)){
        throw new APIError(400,"Invalid data provided");
    }
    const exisitngCommentLike=await Like.findOne({comment:commentId})
    if(exisitngCommentLike){
        await exisitngCommentLike.deleteOne()
        return res.status(200).json(new APIResponse(200,"Comment unliked successfully",null));
    }
    const newCommentLike=await Like.create({
        likedBy:userId,
        comment:commentId
    })
    await newCommentLike.save()
    return res.status(200).json(new APIResponse(200,"Comment liked successfully",newCommentLike));
})

const toggleTweetLike=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params
    const userId=req.user._id
    if(userId.toString()===undefined || !mongoose.Types.ObjectId.isValid(tweetId)){
        throw new APIError(400,"Invalid data provided");
    }
    const existingTweetLike=await Like.findOne({likedBy:userId,tweet:tweetId})
    if(existingTweetLike){
        await existingTweetLike.deleteOne()
        return res.status(200).json(new APIResponse(200,"Tweet unliked successfully",null));
    }
    const newTweetLike=await Like.create({
        likedBy:userId,
        tweet:tweetId
    })
    await newTweetLike.save()
    return res.status(200).json(new APIResponse(200,"Tweet liked successfully",newTweetLike));

})

// const getLikedVideos=asyncHandler(async(req,res)=>{
//     const userId=req.
// })
export {toggleVideoLike,toggleCommentLike,toggleTweetLike};