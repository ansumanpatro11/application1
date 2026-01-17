import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { APIResponse } from "../utils/APIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getALLvideos=asyncHandler(async(req,res)=>{
    const {page=1,limit=10,query,sortBy,sortType,userID}=req.query;

})

const publishVideo=asyncHandler(async(req,res)=>{
    console.log(req.body)
    const {title,description}=req.body;
    const userId=req.user._id;
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new APIError(401,"Unauthorized user");
    }
    if(!title || !description){
        throw new APIError(400,"All fields are required");
    }
    console.log(req.files.video,req.files.thumbnail)
    const videoLocalPath=req.files?.video[0].path
    const thumbnailLocalPath=req.files?.thumbnail[0].path
    console.log(videoLocalPath,thumbnailLocalPath)
    if(!videoLocalPath || !thumbnailLocalPath){
        throw new APIError(400,"Video and thumbnail files are required");
    }
    const uploadedVideo=await uploadOnCloudinary(videoLocalPath);
    const uploadedThumbnail=await uploadOnCloudinary(thumbnailLocalPath);
    console.log(uploadedVideo,uploadedThumbnail)
    if(!uploadedVideo?.url || !uploadedThumbnail?.url){
        throw new APIError(500,"Error uploading files to cloud");
    }
    const newVideo=await Video.create({
        title,
        description,
        videoFile:uploadedVideo.url,
        thumbnail:uploadedThumbnail.url,
        owner:userId,
        duration:uploadedVideo.duration,
    });
    // await newVideo.save();
    return res.status(201).json(new APIResponse(201,"Video published successfully",newVideo));
})

const deleteVideo=asyncHandler(async(req,res)=>{
    const {videoID}=req.params;
    const userId=req.user._id;
    if(!mongoose.Types.ObjectId.isValid(videoID)){
        throw new APIError(400,"invalid video ID provided")
    }
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new APIError(401,"Unauthorized user");
    }
    if(findbyId(videoID).owner.toString()!==userId.toString()){
        throw new APIError(403,"Unauthorized to delete this video");
    }
    await Video.findByIdAndDelete(videoID)
    return res.status(200).json(new APIResponse(200,"Video deleted",null))
})

const updateVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {title,description,thumbnail}=req.body;
    const userId=req.user._id
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new APIError(400,"invalid video ID")
    }

    await Video.findByIdAndUpdate(videoId,{
        title,
        description,
        thumbnail
    },{new:true}
    )
    const video=await Video.findById(videoId)
    return res.status(200).json(new APIResponse(200,"Video updated successfully",video))
})

const getVideoDetails=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new APIError(400,"invalid video ID")
    }
    const video=await Video.findById(videoId).populate("owner","name email avatar");
    if(!video){
        throw new APIError(404,"video not found")
    }
    return res.status(200).json(new APIResponse(200,"Video details fetched successfully",video))
})

const togglePublishStatus=asyncHandler(async(req,res)=>{
    const { videoId}=req.params
    const userId=req.user._id
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new APIError(400,"invalid video ID")
    }
    const video=await Video.findbyId(videoId)
    if(!video){
        throw new APIError(404,"video not found")
    }
    if(video.owner.toString()!==userId.toString()){
        throw new APIError(403,"Unauthorized to change publish status")
    }
    video.isPublished=!video.isPublished
    await video.save()
    return res.status(200).json(new APIResponse(200,"video publish status toggled",video))

})


export {getALLvideos,publishVideo,togglePublishStatus,deleteVideo,updateVideo,getVideoDetails};