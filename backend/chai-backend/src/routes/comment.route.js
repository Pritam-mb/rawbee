import { Router } from 'express';
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller.js"
import {verifyjwt} from "../middlewares/auth.middlewire.js"

const router = Router();

router.route("/:videoId").get(getVideoComments);
router.route("/:videoId").post(verifyjwt, addComment);
router.route("/c/:commentId").delete(verifyjwt, deleteComment);
router.route("/c/:commentId").patch(verifyjwt, updateComment);

export default router;