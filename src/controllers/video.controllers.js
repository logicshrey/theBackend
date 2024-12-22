import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"


const uploadVideo = asyncHandler( async(req,res) => {

    const { title,description, } = req.body 

    if([title,description].some((ele)=>{
        return ele?.trim()===""
    })){
        throw new ApiError(400,"Required fields are missing!")
    }
    
    const videoFileLocalPath = req.files?.videoFile?(req.files.videoFile[0]?.path):null

    if(!videoFileLocalPath){
        throw new ApiError(400,"Video file is required!")
    }

    const thumbnailLocalPath = req.files?.thumbnail?(req.files.thumbnail[0]?.path):null

    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail is required!")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    
    if(!videoFile){
        throw new ApiError(500,"Something went wrong while uploading video on cloudinary!")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(500,"Something went wrong while uploading thumbnail on cloudinary!")
    }

    const duration = videoFile?.duration

    const video = await Video.create({
        title,
        description,
        duration,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner: req.user?._id
    })

    const uploadedVideo = await Video.findById(video._id)
  
    if(!uploadedVideo){
        throw new ApiError(500,"Something went wrong while uploading video!")
    }
    
    res
    .status(200)
    .json(new ApiResponse(200,uploadedVideo,"Video Uploaded Successfully!"))


} )

export {
    uploadVideo
}