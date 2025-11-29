import { toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels } from "../controllers/subscription.controller.js";
import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middlewire.js";

const router = Router();
router.route("/toggle-subscription/:channelId").post(verifyjwt, toggleSubscription);
router.route("/subscribers/:channelId").get(verifyjwt, getUserChannelSubscribers);
router.route("/subscribed-channels/:subscriberId").get(verifyjwt, getSubscribedChannels);
export default router;