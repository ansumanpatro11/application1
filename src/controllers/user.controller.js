import asyncHandler from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";    
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/APIResponse.js";

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
    console.log(fullName,email,username,password);

    res.status(201).json({message:"User registered successfully"})
    if([fullName,email,username,password].some((field)=>field?.trim()==="")  
    ){
        throw new APIError("All fields are required",400);
    }
    const existingUser = User.findOne({
        $or:[{email},{username}]
    })
    if(existingUser){
        throw new APIError("User already exists",409);
    }
    const avatarLocalPath=req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new APIError("Avatar is required",400);
    }
    if(coverImageLocalPath===undefined){
        throw new APIError("Cover image is required",400);
    }
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

export {registerUser};