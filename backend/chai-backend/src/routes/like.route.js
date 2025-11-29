import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    // toggleTweetLike,
    toggleVideoLike,
} from "../controllers/like.controller.js"
import {verifyjwt} from "../middlewares/auth.middlewire.js"

const router = Router();

// All routes require authentication
router.use(verifyjwt);

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
// router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router;
