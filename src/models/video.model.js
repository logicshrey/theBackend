import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new mongoose.Schema({
      title:{
        type: String,
        required: true,
        unique: true 
      },
      description:{
        type: String,
        required: true, 
      },
      duration:{
        type: Number
      },
      views: {
        type: Number,
        default: 0
      },
      videoFile:{
        type: String,
        required: true
      },
      thumbnail:{
        type: String,
        required: true
      },
      owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
      }
},
{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)