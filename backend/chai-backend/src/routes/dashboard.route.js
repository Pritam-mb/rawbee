import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js"
import {verifyjwt} from "../middlewares/auth.middlewire.js"

const router = Router();

// All routes require authentication
router.use(verifyjwt);

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;