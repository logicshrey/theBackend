import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
      username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
      },
      fullName:{
        type: String,
        required: true
      },
      email:{
        type: String,
        required: true,
        unique: true
      },
      avatar:{
        type: String,
        required: true
      },
      coverImage:{
        type: String
      },
      password:{
        type: String,
        required: true
      },
      refreshToken:{
        type: String
      },
      watchHistory:{
        type: Schema.Types.ObjectId,
        ref:"Video"
      } 

}, {timestamps:true})

export const User = mongoose.model("User",userSchema)