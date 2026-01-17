import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { APIResponse } from "../utils/APIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";

const getVideoComments=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const {page=1,limit=10}=req.query;
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new APIError(400,"Invalid video ID provided");
    }
    const comments=await Comment.find({video:videoId})
    .skip((page-1)*limit)
    .limit(parseInt(limit))
    .populate('owner','username avatar')
    .sort({createdAt:-1});
    const totalComments=await Comment.countDocuments({video:videoId});
    return res.status(200).json(new APIResponse(200,"Comments fetched successfully",{
        comments,
        totalPages:Math.ceil(totalComments/limit),
        currentPage:parseInt(page)
    }));

})

const addComment=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const {content}=req.body;
    const userId=req.user._id;
    if(!content || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new APIError(400,"Invalid data provided");
    }
    const newComment=await Comment.create({
        content,
        video:videoId,
        owner:userId
    })
    await newComment.save();
    return res.status(201).json(new APIResponse(201,"comment added successfully",newComment));
})

const deleteComment=asyncHandler(async(req,res)=>{
    const {commentID}=req.params;
    const userId=req.user._id;
    if(!commentID || !mongoose.Types.ObjectId.isValid(commentID)){
        throw new APIError(400,"Invalid comment ID provided");
    }
    const comment=await Comment.findById(commentID);
    if(!comment){
        throw new APIError(404,"Comment not found");
    }
    if(comment.owner.toString()!==userId.toString()){
        throw new APIError(403,"Unauthorized to delete this comment");
    }
    await comment.deleteOne();
    return res.status(200).json(new APIResponse(200,"comment deleted successfully",null));
})

const updateComment=asyncHandler(async(req,res)=>{
    const {commentID}=req.params;
    const {content}=req.body;
    const userId=req.user._id;
    if(!commentID || !content || !mongoose.Types.ObjectId.isValid(commentID)){
        throw new APIError(400,"Invalid data provided");
    }
    const comment=await Comment.findById(commentID);
    if(!comment){
        throw new APIError(404,"Comment not found");
    }
    if(comment.owner.toString()!==userId.toString()){
        throw new APIError(403,"Unauthorized to update this comment");
    }
    const updatedComment=await Comment.findByIdAndUpdate(commentID,{
        content
    },{new:true});
    return res.status(200).json(new APIResponse(200,"Comment updated successfully",updatedComment));
})

export {getVideoComments,addComment,deleteComment,updateComment};