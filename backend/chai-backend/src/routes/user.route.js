import { Router } from "express";
import { loginuser, logoutuser, register,refreshAcessToken,getcurrentuser,changepassword,updateuser,avatarupdate,getuserchannelprofile,watchistory } from "../controllers/user.controller.js";
import { getAllVideos, publishAVideo } from "../controllers/video.controller.js";
import { upload} from "../middlewares/multer.middlewire.js"
import { verifyjwt } from "../middlewares/auth.middlewire.js";
import apicache from "apicache";

const router = Router();
router.route("/register").post(
    upload.fields([   //middlewire which take avater and coverimage file
        {
            name: "avatar",
            maxCount: 1
        },{
            name: "coverImage",
            maxCount: 1
        }
    ]),
    register)

router
    .route("upload-video")
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        verifyjwt, publishAVideo
    );
    

router.route("/login").post(loginuser)


//secure routes
router.route("/logout").post(verifyjwt, logoutuser)
router.route("/refresh-token").post(refreshAcessToken)
router.route("/change-password").post(verifyjwt, changepassword)
router.route("/current-user").get(verifyjwt, getcurrentuser)
router.route("/update-user").patch(verifyjwt, updateuser)
router.route("/update-avatar").patch(verifyjwt,
    upload.single("avatar"), avatarupdate) 
router.route("/update-coverimage").patch(verifyjwt,
    upload.single("coverImage"), updateuser)
router.route("/channel/:username").get(verifyjwt,getuserchannelprofile)
router.route("/watch-history").get(verifyjwt, watchistory)
export default router;