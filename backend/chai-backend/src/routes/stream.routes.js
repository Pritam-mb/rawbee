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
  createLiveRoom,
  joinLiveRoom,
  leaveLiveRoom,
  getLiveRoomDetails,
  endLiveRoom,
  getActiveLiveRooms,
} from "../controllers/stream.controller.js";
import { verifyjwt } from "../middlewares/auth.middlewire.js";

const router = Router();

// Public routes
router.route("/live").get(getLiveStreams);
router.route("/:streamId").get(getStreamById);

// Live room public routes
router.route("/live-rooms/active").get(getActiveLiveRooms);
router.route("/live-room/:streamId").get(getLiveRoomDetails);

// Protected routes
router.use(verifyjwt); // Apply JWT verification to all routes below

router.route("/start").post(startStream);
router.route("/:streamId/end").post(endStream);
router.route("/:streamId/join").post(joinStream);
router.route("/:streamId/leave").post(leaveStream);
router.route("/:streamId/toggle-chat").patch(toggleChat);
router.route("/history").get(getStreamHistory);

// Live room protected routes
router.route("/create-live-room").post(createLiveRoom);
router.route("/live-room/:streamId/join").post(joinLiveRoom);
router.route("/live-room/:streamId/leave").post(leaveLiveRoom);
router.route("/live-room/:streamId/end").post(endLiveRoom);

export default router;
