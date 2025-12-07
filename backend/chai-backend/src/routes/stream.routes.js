import { Router } from "express";
import {
  startStream,
  endStream,
  getLiveStreams,
  getStreamById,
  joinStream,
  leaveStream,
  toggleChat,
  getStreamHistory,
} from "../controllers/stream.controller.js";
import { verifyjwt } from "../middlewares/auth.middlewire.js";

const router = Router();

// Public routes
router.route("/live").get(getLiveStreams);
router.route("/:streamId").get(getStreamById);

// Protected routes
router.use(verifyjwt); // Apply JWT verification to all routes below

router.route("/start").post(startStream);
router.route("/:streamId/end").post(endStream);
router.route("/:streamId/join").post(joinStream);
router.route("/:streamId/leave").post(leaveStream);
router.route("/:streamId/toggle-chat").patch(toggleChat);
router.route("/history").get(getStreamHistory);

export default router;
