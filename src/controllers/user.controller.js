import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";    
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/APIResponse.js";
import jwt from "jsonwebtoken";
import { use } from "react";


const generateAccessAndRefreshToken=async(userId)=>{
    try{
        const user=await User.findById(userId);
        const refreshToken=user.generateRefreshToken();
        const accessToken=user.generateAccessToken();

        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken};

    }catch(error){
        throw new APIError("Error while generating tokens",500);
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    //get user details from frontend
    //validation -not empty
    //check if user already exists-email
    //ccheck for images,avatar
    //upload in cloudinary,avatar
    //create user object-create entry in db
    //remove pwd,refresh token from response
    //check for user creation success
    //send response back to frontend
    const{fullName,email,username,password}=req.body
    // console.log(fullName,email,username,password);

    
    if([fullName,email,username,password].some((field)=>field?.trim()==="")  
    ){
        throw new APIError("All fields are required",400);
    }


    const existingUser = await User.findOne({
        $or:[{email},{username}]
    })
    if(existingUser){
        throw new APIError("User already exists",409);
    }

    
    const avatarLocalPath=req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new APIError("Avatar is required",400);
    }
    // if(coverImageLocalPath===undefined){
    //     throw new APIError("Cover image is required",400);
    // }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar?.url){
        throw new APIError("Error while uploading avatar",500);
    }
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        username:username.toLowerCase(),
        password
    })

    const createdUser=await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new APIError("Error while registering user",500);
    }
    return res.status(201).json(new APIResponse(200,"User registered successfully",createdUser))

    
    //logic to register user
})

const loginUser=asyncHandler(async(req,res)=>{
    //get email,pwd from frontend
    //validation
    //chek if user exists
    //compare pwd
    //generate access token, refresh token
    //store refresh token in db
    //send response with access token, user details
    const {email,username,password}=req.body
    console.log(email);
    
    if(!(username||email)){
        throw new APIError("Email or username are required",400);
    }
    const user=await User.findOne({
        $or:[{email},{username}]
    })
    if(!user){
        throw new APIError("User not found",404);
    }
    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new APIError(404,"Invalid credentials");
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

    const options={
        httpOnly:true,
        secure:true,

    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new APIResponse(200,{
        user:loggedInUser,accessToken,refreshToken
    },"User logged in successfully"))
})


const logOutUser=asyncHandler(async(req,res)=>{
    //get user id from req.user
    //find user in db
    //remove cookies
    //remove refresh token from db
    //send response back to frontend
    await User.findByIdAndUpdate(req.user._id,{
        $set:{refreshToken:null}
    },{
        new:true,
    })

    const options={
        httpOnly:true,
        secure:true,
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new APIResponse(200,"User logged out successfully"))

})

const refreshAcessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken =req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new APIError("Unauthorized request",401);
    }
    try {
        const decoded=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user=await User.findById(decoded?._id)
        if(!user){
            throw new APIError("User not found",404);
        }
        if(incomingRefreshToken!==user?.refreshToken){
            throw new APIError("token expired",401);
    
        }
        const options={
            httpOnly:true,
            secure:true,
        }
        const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new APIResponse(200,{accessToken,refreshToken
        },"Access token refreshed successfully"))
    } catch (error) {
        throw new APIError(error?.message||"Invalid token",401);
    }
    
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user=await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new APIError("Old password is incorrect",400);
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})
    return res.status(200).json(new APIResponse(200,"Password changed successfully"))
})

const getCurrentUserDetails=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new APIResponse(200,"User details fetched successfully",req.user))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body
    if(!fullName&&!email){
        throw new APIError("Full name and email are required",400);
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email:email
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200).json(new APIResponse(200,"Account details updated successfully",user))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new APIError("Avatar image is required",400);
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    if(!avatar?.url){
        throw new APIError("error while uploading on cloudinary",500)
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200).json(new APIResponse(200,"Avatar updated successfully",user))
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath){
        throw new APIError("coverImage image is required",400);
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage?.url){
        throw new APIError("error while uploading on cloudinary",500)
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200).json(new APIResponse(200,"coverImage updated successfully",user))
})

export {loginUser,registerUser,logOutUser,refreshAcessToken,changeCurrentPassword,getCurrentUserDetails,updateAccountDetails,updateUserAvatar,updateUserCoverImage};