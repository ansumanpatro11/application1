import { APIError } from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT=asyncHandler(async(req, _,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new APIError("Unauthorized access, token missing",401);
        }
        const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await User.findById(decoded?._id).select("-password -refreshToken");
        if(!user){
            
            throw new APIError("Unauthorized access, user not found",401);
        }
        req.user=user;
        next()
    } catch (error) {
        throw new APIError("Unauthorized access, invalid token",401);
    }
} )