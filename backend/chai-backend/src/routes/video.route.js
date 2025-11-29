import {
    togglePublishStatus,
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo
} from "../controllers/video.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middlewire.js";
import { verifyjwt } from "../middlewares/auth.middlewire.js";

const router = Router();
router.route("/get-videos").get(getAllVideos);
router
    .route("/upload-video").post(
        verifyjwt,
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
        publishAVideo
    );
    router.route("/video/:videoId").get(getVideoById);
    router.route("/video/:videoId").patch(
        verifyjwt,  
        upload.single("thumbnail"),
        updateVideo
    );
    router.route("/video/:videoId").delete(verifyjwt, deleteVideo);
    router.route("/video/toggle-publish/:videoId").patch(verifyjwt, togglePublishStatus);
export default router;