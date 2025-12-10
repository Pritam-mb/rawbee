import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber :{
        type: Schema.Types.ObjectId, // who is subscribing
        ref: "Users",

    },
    channel:{
        type: Schema.Types.ObjectId, //owner of channel
        ref: "Users",
    }
},{
    timestamps: true
})

export const subscription = mongoose.model("subscriptions",subscriptionSchema)