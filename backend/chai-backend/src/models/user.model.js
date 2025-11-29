// import { use } from "react";
import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken" // for generating token
import bcrypt from "bcrypt"  // for hashing password or encrypting password
const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true  // for optimise searching techniqs
    }
    ,
     email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        // index: true  // for optimise searching techniqs
    },
     fullname:{
        type: String,
        required: true,
        // unique: true,
        // lowercase: true,
        trim: true,
        index: true  // for optimise searching techniqs
    },
    avatar:{
        type: String,
        required: true
    },
    coverImage:{
        type: String,
        // required: true 
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Videos"
        }
    ],
    password:{
        type: String,
        required: [true, 'password is required']

    },
    refreshToken:{
        type: String
    }


},{
    timestamps:true
})

 
//encrypt password before storing
userSchema.pre("save", async function (next) {  // next is just passing the control to next function
    if(! this.isModified("password")) return next()
    this.password =  await bcrypt.hash(this.password,10)  // hashing the password
    next()
})

userSchema.methods.ispasswordCorrect =async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken = function(){  // for generating token
    return jwt.sign({
        _id : this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname,},
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d"
    })
}
userSchema.methods.generateRefreshToken = function(){ //longlived
     return jwt.sign({
        _id : this._id,
       },
    process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d"
    })
}
export const User = mongoose.model("Users",userSchema)