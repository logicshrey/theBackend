import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

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

userSchema.pre("save", async function(next){
    if(!(this.isModified(this.password))){
        return next();
    }
    this.password = await bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    const accessToken = jwt.sign({ 
      id:this._id,
      username:this.username,
      email:this.email     
     }, 
     process.env.ACCESS_TOKEN_SECRET, 
     { algorithm: 'RS256',
       expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      });

     return accessToken; 
}

userSchema.methods.generateRefreshToken = function(){
    const refreshToken = jwt.sign({ 
      id:this._id,
     }, 
     process.env.REFRESH_TOKEN_SECRET, 
     { algorithm: 'RS256',
       expiresIn: process.env.REFRESH_TOKEN_SECRET
      });

     return refreshToken; 
}

export const User = mongoose.model("User",userSchema)