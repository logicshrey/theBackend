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

const deleteVideo = asyncHandler( async(req,res) => {

    const  { videoId } = req.params

    if(!videoId){
        new ApiError(404,"Video Id not found!")
    }

    const video = await Video.findByIdAndDelete(videoId)

    if(!video){
        new ApiError(500,"Something went wrong while deleting video!")
    }

    await destroyOnCloudinary(video.videoFile)
    await destroyOnCloudinary(video.thumbnail)

    res
    .status(200)
    .json(new ApiResponse(200,video,"Video deleted successfully!"))
} )

const editVideoDetails = asyncHandler( async(req,res) => {

    const { title, description } = req.body
    const { videoId } = req.params

    if(!videoId){
        new ApiError(400,"Video Id not found!")
    }

    if(!title){
        new ApiError(400,"Title is required!")
    }

    if(!description){
        new ApiError(400,"Description is required!")
    }

    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set:{
                title,
                description
            }
        },
        {
            new:true
        }
    )

    if(!video){
        throw new ApiError(500,"Something went wrong while editing video details!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,video,"Video details edited successfully!"))
} )

const getVideoDetailsById = asyncHandler( async(req,res) => {

    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400,"Video Id is required!")
    }


    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",

                pipeline:[
                    {
                        $project:{
                            username:1,
                            email:1,
                            _id:1,
                            fullName:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])

    if(!video){
       throw new ApiError(400,"Video not found! Invalid video Id")
    }
    
    res
    .status(200)
    .json(new ApiResponse(200,video[0],"Video details fetched successfully!"))
    
} )

const getAllVideos = asyncHandler( async(req,res) => {

    const videos = await Video.find({})

    if(!videos){
        throw new ApiError(500,"Something went wrong while fetching videos!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,videos,"All videos fetched successfully!"))

} )

const updateVideoViews = asyncHandler( async(req,res) => {

    const { videoId } = req.params
    
    if(!videoId){
        throw new ApiError(400,"Video Id is missing!")
    }

    const video = await Video.findByIdAndUpdate(videoId,
        {
          $inc:{ views: 1 }
        },
        {
            new:true
        }
    )

    if(!video){
        throw new ApiError(400,"Invalid Video Id!!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,video,"Views on video is updated!"))

} )

export {
    uploadVideo,
    deleteVideo,
    editVideoDetails,
    getVideoDetailsById,
    getAllVideos,
    updateVideoViews
}