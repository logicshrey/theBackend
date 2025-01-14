import {ApiError} from "../utils/apiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"


const verifyJWT = async (req,_,next) => {

    try {
        const token = req.cookies?.accessToken

        if(!token){
            throw new ApiError(401,"Unauthorized Access - User does not have access token!")
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        // console.log(decodedToken)  

        const user = await User.findById(decodedToken?._id)
        
        if(!user){
            throw new ApiError(401,"Invalid Access Token!")
        }
    
        req.user = user
        next()
    } 
    catch (error) {
        throw error
        // throw new ApiError(401, "Error while verifying JWT", error)
        // console.log("Error while verifying JWT", error)
    }
   

}

export { verifyJWT }

