import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, destroyOnCloudinary } from "../utils/cloudinary.js"


const cookieOptions = {
     httpOnly : true,
     secure: true
}

const generateAccessAndRefreshToken = async (user) => {
  try {
      const userfortoken = await User.findById(user._id)
      
      if(!userfortoken){
        throw new ApiError(404, "User does not found while generating Access and Refresh Token!")
      }

      const accessToken = await userfortoken.generateAccessToken()

      if(!accessToken){
        throw new ApiError(500,"Something went wrong while generating Access Token!")
      }

      const refreshToken = await userfortoken.generateRefreshToken()

      if(!refreshToken){
        throw new ApiError(500,"Something went wrong while generating Refresh Token!")
      }
      
    //   console.log("Access Token: ",accessToken)
    //   console.log("Refresh Token: ",refreshToken)

      userfortoken.refreshToken = refreshToken
      userfortoken.save({ validateBeforeSave: false })
      
      return { accessToken, refreshToken }
  } 
  catch (error) {
     console.log("Some error occurred while generating access and refresh tokens: ",error) 
  }
}


const register = asyncHandler( async (req,res) => {

    const {username,fullName,email,password} = req.body 

    if([username,fullName,email,password].some((ele) => {
        return ele?.trim()==""
    })){
       throw new ApiError(400,"Required fields are missing!")
    }

    const avatarLocalPath = req.files?.avatar?(req.files.avatar[0]?.path):null
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required!")
    }
    
    const coverImageLocalPath = req.files?.coverImage?(req.files.coverImage[0]?.path):null
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError(500,"Something went wrong while uploading avatar on cloudinary!")
    }
    
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    const user = await User.create({
        fullName,
        email,
        username,
        password,
        avatar: avatar.url,
        coverImage: coverImage?coverImage.url:null     
    })

    const createdUser = await User.findById(user._id).select("-password  -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Internal Server Error while registering the user! Please try again.")
    }

    res
    .status(200)
    .json(new ApiResponse(200,createdUser,"User Registered Successfully!"))

} )

const login = asyncHandler( async (req,res) => {
      
    const {username,password} = req.body

    if(!username){
        throw new ApiError(400,"Username is required!")
    }

    if(!password){
        throw new ApiError(400,"Password is required!")
    }
    
    const user = await User.findOne({username})

    if(!user){
        throw new ApiError(404,"User does not exist!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(400,"Invalid User Credentials!")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user)
     
    //   console.log("Access Token: ",accessToken)
    //   console.log("Refresh Token: ",refreshToken)
   
    const updatedUser = await User.findById(user._id).select("-password -refreshToken")
    
    res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200,updatedUser,"User logged in successfully!"))

} )

const logout = asyncHandler( async (req,res) => {
      
    const user = await User.findByIdAndUpdate(
        req.user._id,
    {
        $unset:{refreshToken:1}
    },
    {
        new:true
    })

    res
    .status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(new ApiResponse(200,{},"User logged out successfully!"))
})

const updateUserDetails = asyncHandler( async (req,res) => {

      const {fullName,email} = req.body

      if(!fullName){
        throw new ApiError(400,"Fullname is required!")
      }

      if(!email){
        throw new ApiError(400,"Email is required!")
      }

      const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {
            new:true
        }
      ).select("-password -refreshToken")

      if(!user){
        throw new ApiError(500,"Something went wrong while updating user details!")
      }

    res
    .status(200)
    .json(new ApiResponse(200,user,"User details updated successfully!"))

} )

const updateAvatar = asyncHandler( async (req,res) => {
    
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required!")
    }
    
    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(500,"Something went wrong while updating user avatar!")
    }

    await destroyOnCloudinary(user.avatar)

    const newAvatar = await uploadOnCloudinary(avatarLocalPath)

    if(!newAvatar){
        throw new ApiError(500,"Something went wrong while uploading avatar on cloudinary!")
    }

    user.avatar = newAvatar.url
    user.save({validateBeforeSave:false})
    
    res
    .status(200)
    .json(new ApiResponse(200,{},"Avatar updated successfully!"))
} )

const updateCoverImage = asyncHandler( async (req,res) => {
    
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image is required!")
    }
    
    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(500,"Something went wrong while updating the cover image!")
    }

    await destroyOnCloudinary(user.coverImage)

    const newCoverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!newCoverImage){
        throw new ApiError(500,"Something went wrong while uploading cover image on cloudinary!")
    }

    user.coverImage = newCoverImage.url
    user.save({validateBeforeSave:false})
    
    res
    .status(200)
    .json(new ApiResponse(200,{},"Cover Image updated successfully!"))
} )


const changePassword = asyncHandler( async(req,res) => {

    const {oldPassword, newPassword} = req.body

    if(!oldPassword){
        throw new ApiError(401,"Current Password is required!")
    }
    
    if(!newPassword){
        throw new ApiError(401,"New Password is required!")
    }

    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(500,"Something went wrong while changing the password!")
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid Current Password!")
    }

    user.password = newPassword
    user.save({validateBeforeSave:false})

    res
    .status(200)
    .json(new ApiResponse(200,{},"Password Changed Successfully!"))

} )

export{ 
    register, 
    login, 
    logout, 
    updateUserDetails, 
    updateAvatar, 
    updateCoverImage,
    changePassword 
}