import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import { Subscription } from "../models/subscription.model.js"

const getChannelInfo = asyncHandler( async(req,res) => {

    const {channelId} = req.params
   
   if(!channelId){
    throw new ApiError(400,"Channel Id is missing!")
   }

   const channelInfo = await User.aggregate([

    {
        $match:{
                _id: new mongoose.Types.ObjectId(channelId) 
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"
        }
    },
    {
        $addFields:{
            subscriberCount:{
                $size: "$subscribers"
            },

            subscribedToCount:{
                $size: "$subscribedTo"
            },

            isUserSubscribed:{
                $cond: {
                    if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                    then: true,
                    else: false
                }
            }
        }
    },
    {
        $project:{
            username:1,
            fullName:1,
            email:1,
            avatar:1,
            coverImage:1,
            subscriberCount:1,
            subscribedToCount:1,
            isUserSubscribed:1
        }
    }

   ])

   if(!channelInfo){
    throw new ApiError(400,"Something went wrong while fetching channel information!")
   }

   res
   .status(200)
   .json(new ApiResponse(200,channelInfo[0],"Channel Info fetched successfully!"))

} )

const addSubscriber = asyncHandler ( async (req,res) => {
      
    const {channelId} = req.params

    if(!channelId)
    {
        throw new ApiError(400,"Channel Id is missing!")
    }

    const subscribedInfo = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    })

    if(!subscribedInfo){
        throw new ApiError(500,"Something went wrong while adding subscription!")
    }

    res
    .status(200)
    .json(new ApiResponse(200,subscribedInfo,"Subscription added successfully!"))

} )

export { getChannelInfo, addSubscriber }