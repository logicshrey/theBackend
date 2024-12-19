import mongoose from "mongoose"
import DB_NAME from "../constants.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const dbconnect = asyncHandler( async (req,res) => {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
})

export { dbconnect }