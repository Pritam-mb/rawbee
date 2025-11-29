// import { JsonWebTokenError } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import apierror from "../utils/apierror.js";
export const verifyjwt = asyncHandler(async (req, res, next) => {
 try {
       const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") // getting token from cookies or headers
       // we can access token bec we provide it already in app.js as cookieperser which give the access to cookies having token
       if (!token) {
           throw new apierror("unauthenticated access", 401) // custom error class
       }
   
      const decodetoken= jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) // verifying token by secret key
      const user =await User.findById(decodetoken?._id).select("-password -refreshtoken") // finding user by id present in token and reset user by del tokens so that he cant access anymore
      if(!user){
       throw new apierror("user not found",404)
      }
      req.user = user
      next()
 } catch (error) {
    throw new apierror("invalid token",401)
 }

})