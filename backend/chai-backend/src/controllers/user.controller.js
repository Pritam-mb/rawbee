import { request, response } from "express"
import {asyncHandler} from "../utils/asyncHandler.js"
import apierror from "../utils/apierror.js";
import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken"
import {uploadCloudinary} from "../utils/cloudinary.js"
import { apiresponse } from "../utils/apiresponse.js";
import { upload } from "../middlewares/multer.middlewire.js";
import mongoose from "mongoose";
const generatetokens = async (userid) => {
  try {
    console.log("🟩 Generating tokens for user:", userid);

    const user = await User.findById(userid);
    if (!user) {
      console.log("❌ No user found for ID:", userid);
      throw new apierror("User not found", 404);
    }

    console.log("✅ User found:", user.email);

    const accesstoken = user.generateAccessToken();
    const refreshtoken = user.generateRefreshToken();

    user.refreshtoken = refreshtoken;
    await user.save({ validateBeforeSave: false });

    console.log("✅ Tokens generated successfully");
    return { accesstoken, refreshtoken };
  } catch (error) {
    console.error("❌ Token generation error:", error);
    throw new apierror("something went wrong", 500);
  }
};

// import {fullname, email } from "../models/user.model.js"
const register = asyncHandler(async (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    // get details from user
    //validation - not empty
    //check if user already exist : username email
    //avater exist , check for images
    //upload to cloudinary, avater
    // create user object - create entry at db
    // remove password and refresh token field from response
    // check for user validation - exist or  upload everthing or not
    // return response

    const { fullname, email, username, password } = req.body
    console.log("email:", email);

    // Validate required fields: non-empty strings after trimming
    if ([fullname, email, username, password].some(e => !e || (typeof e === "string" && e.trim() === ""))) {
        throw new apierror("Please provide fullname, email, username and password", 400)
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
    throw new apierror("Invalid email format", 400);
   }


   const existuser = await User.findOne({ //check user exist
    $or: [{username},{email}]
   })
   if (existuser) {
    throw new apierror("User with this email or username already exists",409)
   }
   
     const avatarlocal= req.files?.avatar[0]?.path //check if avatar exist
    //  const coverlocal= req.files?.coverImage[0]?.path; //it actually get the file path which multer  returns the img url
    let coverlocal;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverlocal = req.files.coverImage[0].path
    }
     if(!(avatarlocal)){
        throw new apierror("Avatar image is required",400)
    }
    const avatarfile = await uploadCloudinary(avatarlocal) //upload cloudinary
    const coverfile = await uploadCloudinary(coverlocal)

    if(!avatarfile){
            throw new apierror("Failed to upload avatar image",400)

    }
   const user = await User.create({  //create a user 
        fullname,
        avatar: avatarfile.url,
        coverImage: coverfile?.url || "",//cloudnary gives full object we just want url
        email,
        password,
        username: username.toLowerCase()
    })
    const createuser = await User.findById(user._id).select("-password -refreshToken") // thsi is final of user

    if(!createuser){
        throw new apierror("something went wrong",500)
    }

    return res.status(201).json(
        new apiresponse(202, createuser, "successfully created")
    )
})

const loginuser = asyncHandler(async (req,res)=>{
            //req body
            //username or email
            //find the user
            //password check

            //access and refresh token
            //send cookie
            //response

            const {email,password,username} = req.body

            if(!(username || email)){
                throw new apierror("email or username provide pls",400)
            }
            const user = await User.findOne(
              {  $or: [{email},{username}]
            })

            if(!user){
                throw new apierror("User does not exist. Please register first.", 404)
            }
            
            const ispasswordvalid = await user.ispasswordCorrect(password)
            if(!ispasswordvalid){
                throw new apierror("password incorrect",401)
            }

         const {accesstoken,refreshtoken} = await  generatetokens(user._id)
            // here when we take user it doesnt have refresh token  so we need to fetch again bec it is empty
       
            const loggedinuser = await User.findById(user._id).select("-password -refreshtoken") //here we are fetching the user again to get the refresh token
            const options ={ 
                httpOnly: true, // not accessible from frontend js
                secure: true
            }
            //cookiies are basically stored data like refresh token which help browser to remember if u logged in or not for short term
            return res.status(200)
            .cookie("refreshToken", refreshtoken, options) // we are storing refresh token in cookie so that it is not accessible from frontend
            .cookie("accessToken", accesstoken, options)
            .json(
                new apiresponse(200, {
                    user: loggedinuser,
                    accesstoken,refreshtoken
                })
            )
})

const logoutuser = asyncHandler(async (req,res)=>{
    // clear cookies
       // here the user came from auth middlewire where we del the tokens from user
   await User.findByIdAndUpdate(
        req.user._id,
        {

            $set: {
                refreshToken: undefined
            },
        },
            {
                new: true
            }
        
    )
      const options ={ 
                httpOnly: true, // not accessible from frontend js
                secure: true
            }
            return res.status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(new apiresponse(200, {}, "user logged out"))
})


// generate new access token using refresh token because access token has short life span
const refreshAcessToken = asyncHandler(async(req,res)=>{
    const incomingtoken = await req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ","")

    if(!incomingtoken){
        throw new apierror("doesnt get cookies",401)
    }

   try { // verify token
    const decodetoken = jwt.verify(incomingtoken,
         process.env.REFRESH_TOKEN_SECRET
     )
     // if(! decodetoken){
     //     throw new apierror("invalid user",402)
     
    const user =await User.findById(decodetoken?._id) // id from mongo 
    if(!user){
     throw new apierror("user not exist",401)
    }
    if( incomingtoken !== user?.refreshToken){
     throw new apierror("session expired",403)
    }
     const options ={ 
                 httpOnly: true, // not accessible from frontend js
                 secure: true
             }
    const {accesstoken,refreshtoken} = await generatetokens(user._id)
    res.status(200)
    .cookie("accessToken",accesstoken,options)
    .cookie("refreshToken",refreshtoken,options)
    .json(
     new apiresponse(200,{ accesstoken,refreshtoken},
         "cookies restored"
     )
    )
   } catch (error) {
    throw new apierror("genaratoke generating failed",404)
   }
})

const changepassword = asyncHandler(async(req,res)=>{
    const {oldpassword , newpassword , confirmpassword} = req.body  // here the old password means the current password of user 
    
    const user = await User.findById(req.user._id)    // before it we call verify jwt which verify the by taking his cookies and then it store all the user details in req.user.. so we can find id from req.user
   const iscorrect = await user.ispasswordCorrect(oldpassword)

   if(!iscorrect){
    throw new apierror("old password incorrect",400)
   }
    if(newpassword !== confirmpassword){
        throw new apierror("password doesnt match",400)
    }

    user.password = newpassword  // we are directly assigning new password to user password bec we have pre save hook in user model which will hash the password before saving
   
    await user.save({ validateBeforeSave: false}) // here we are skipping the validation bec we are only changing the password not other details
   return res.status(200)
   .json(
    new apiresponse(200, {}, "password changed successfully")
   )

})

const getcurrentuser = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(
        new apiresponse(200, req.user, "current user fetched")
    )
})

const updateuser = asyncHandler(async(req,res)=>{
    const {fullname,username,email} = req.body
    if(! (fullname || username || email)){
        throw new apierror("provide atleast one field to update",400)
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullname: fullname || req.user.fullname,
                username: username || req.user.username,
                email: email || req.user.email
            }
        },
            {new: true}
        
    ).select("-paasword")
    res.status(200).json(
        new apiresponse(200, user, "user updated successfully")
    )

})

const avatarupdate = asyncHandler(async (req,res)=>{
    const avatarlocal= req.file?.path //check if avatar exist
    if(!(avatarlocal)){
       throw new apierror("avatar nahi hai tera",400)
   }
   const avatarfile = await uploadCloudinary(avatarlocal)
     if(!avatarfile.url){
           throw new apierror("avatar dal jaldi",400)
        }
   
           const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    avatar : avatarfile.url
                }
            },
        { new: true }
           ).select("-password")
        // const user = await User.findById(req.user._id)
        // user.avatar = avatarfile.url
         
          
    // await user.save({ validateBeforeSave: false})
            return res.status(200).json(    
        new apiresponse(200, user, "avatar updated successfully")
    )
})


const coverimgupdate = asyncHandler(async (req,res)=>{
    const avatarlocal= req.file?.path //check if avatar exist
    if(!(avatarlocal)){
       throw new apierror("coverimg nahi hai tera",400)
   }
   const avatarfile = await uploadCloudinary(avatarlocal)
     if(!avatarfile.url){
           throw new apierror("avatar dal jaldi",400)
        }
   
           const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    coverImage : avatarfile.url
                }
            },
        { new: true }
           ).select("-password")
        // const user = await User.findById(req.user._id)
        // user.avatar = avatarfile.url
    // await user.save({ validateBeforeSave: false})
    return res.status(200).json(
        new apiresponse(200, user, "cover image updated successfully")
    )

})

const getuserchannelprofile = asyncHandler(async(req,res)=>{
    const {username} = req.params
    if(!username){
        throw new apierror("invalid username",400)
    }
    const channel = await User.aggregate([ // aggregate is used to perform complex queries here we are using lookup to join subscription collection with user collection to get the subscribers of the channel 
      {  $match: {
            username: username.toLowerCase() // to make it case insensitive
        }
    },
        {
            $lookup :{
                from: "subscriptions", // collection name in db  (target collection)
                localField: "_id", // user collection field in current collection
                foreignField: "channel", // subscription collection field in target collection
                as: "subscribers"  // we search the channel in the user documents is it present or not

            }
        },
        {
            $lookup:{
              from: "subscriptions", // collection name in db
                localField: "_id", // user collection field
                foreignField: "subscriber", // subscription collection field
                as: "subscribedchannels"   // we find basicaly subcriber person into every channel either he is subscribed or not
            }
        },{
            $addFields:{
                subscriberscount: {
                    $size: "$subscribers" // size of array
                },
                subscribedchannelscount: {
                    $size: "$subscribedchannels"
                },
                issubscribed:{
                    $cond:{
                        if:{ $in:[ "req.user._id","$subscribers.subscriber"]}, // check if the req.user  is in the subscribers array of the channel
                        then: true,
                        else: false
                    }
                },
            }
        },{
                    $project:{
                        fullname:1,
                        username:1,
                        email:1,
                        avatar:1,
                        coverImage:1,
                        subscriberscount:1,
                        subscribedchannelscount:1,
                        issubscribed:1
                    }
                
            
             }
    ])
    if(!channel?.length){
        throw new apierror("channel not found",404)
    }

    return res.status(200).json(
        new apiresponse(200, channel[0], "channel fetched successfully"))
})

const watchistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchhistoryvideos",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerdetails",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1,

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $arrayElemAt:["$ownerdetails",0]
                            }
                        }
                    }
                ]
            }
        },
    ])
    return res.status(200).json(
        new apiresponse(200, user[0].watchhistoryvideos, "watch history fetched successfully")
    )
}
)
export { register, loginuser,logoutuser,refreshAcessToken,changepassword ,getcurrentuser,updateuser, avatarupdate,coverimgupdate,getuserchannelprofile, watchistory}