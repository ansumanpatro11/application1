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

export {getALLvideos,publishVideo};