import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({
    videoFile:{
        type: String, //cloudnery 3rd party source
        required: true
    },
    thumbnail:{
          type: String,
        required: true
    },
     title:{
          type: String,
        required: true
    },
     description:{
          type: String,
        required: true
    },
    duration:{
        type: Number,
        
    },
    views:{
        type: Number,
        default: 0,
        // required: true
    },
    ispublished:{
        type: Boolean,
        default: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }

},{
    timestamps: true
})
videoSchema.plugin(mongooseAggregatePaginate) // to use pagination in aggregate queries

export const Video = mongoose.model("Video",videoSchema)