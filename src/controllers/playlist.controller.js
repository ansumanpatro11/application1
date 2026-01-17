import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId=req.user._id;
    if(mongoose.Types.ObjectId.isValid(userId)){
        throw new APIError(401,"invalid user")
    }
    const createdPlaylist=await Playlist.create({
        name,
        description,
        owner:userId,
    })
    res.status(201).json(new APIResponse(201,"Playlist created successfulyl",createdPlaylist))
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    const userPlaylists=await Playlist.find({owner:userId})
    res.status(200).json(new APIResponse(200,"User playlists fetched successfully",userPlaylists))
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new APIError(401,"invalid playlist id")
    }
    const playlist=await Playlist.findById(playlistId)
    res.status(200).json(new APIResponse(200,"Playlist fetched successfully",playlist))
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new APIError(401,"invalid playlist id")
    }
    const playlist=await Playlist.findByIdAndUpdate(playlistId,{
        $push:{videos:videoId}
    },{
        new:true
    })
    res.status(200).json(new APIResponse(200,"Video added to playlist successfully",playlist))
    })

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new APIError(401,"invalid playlist id")
    }
    const playlist=await Playlist.findByIdAndUpdate(playlistId,{
        $pull:{videos:videoId}
    },{
        new:true
    })
    res.status(200).json(new APIResponse(200,"Video removed from playlist successfully",playlist))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new APIError(401,"invalid playlist id")
    }
    await Playlist.findByIdAndDelete(playlistId)
    res.status(200).json(new APIResponse(200,"Playlist deleted successfully",null))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new APIError(401,"invalid playlist id")
    }
    const updatedPlaylist=await Playlist.findByIdAndUpdate(playlistId,{
        name,
        description
    },{
        new:true
    })
    res.status(200).json(new APIResponse(200,"Playlist updated successfully",updatedPlaylist))
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