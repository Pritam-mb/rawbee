import { v2 as cloudinary } from "cloudinary";
// import { log } from "console";
import fs from "fs";
//at first we store files in local storage then upload to cloudinary and then delete from local storage
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (filepath)=>{
    try {
        if(! filepath) return null // if no file path is provided
        // upload to cloudinary
       const response= await  cloudinary.uploader.upload(filepath, {
            resource_type: "auto", // this will detect the file type automatically
        })
        // console.log("file uploaded");
        fs.unlinkSync(filepath)
        return response
        // mk
        
    } catch (error) {
        fs.unlinkSync(filepath) // delete the file from local storage

    }
}
export { uploadCloudinary}