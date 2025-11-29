import {
     createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middlewire.js";

const router = Router();

router.route("/").post(verifyjwt, createPlaylist);
router.route("/user-playlists/:userId").get(verifyjwt, getUserPlaylists);

router.route("/:playlistId").get(verifyjwt, getPlaylistById);
router.route("/add-video/:playlistId").post(verifyjwt, addVideoToPlaylist);
router.route("/remove-video/:playlistId").post(verifyjwt, removeVideoFromPlaylist);
router.route("/:playlistId").delete(verifyjwt, deletePlaylist);
router.route("/:playlistId").put(verifyjwt, updatePlaylist);
export default router;