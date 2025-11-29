import apierror from "../utils/apierror.js"
import {apiresponse} from "../utils/apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse("OK", 200, { 
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }))
})

export {
    healthcheck
}