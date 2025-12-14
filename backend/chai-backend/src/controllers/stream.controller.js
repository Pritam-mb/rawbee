import { asyncHandler } from "../utils/asyncHandler.js";
import apierror from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { Stream } from "../models/stream.model.js";
import { User } from "../models/user.model.js";

// Start a new livestream
const startStream = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim()) {
    throw new apierror("Stream title is required", 400);
  }

  // Check if user already has an active stream
  const existingStream = await Stream.findOne({
    host: req.user._id,
    isLive: true,
  });

  if (existingStream) {
    // Automatically end the previous stream
    existingStream.isLive = false;
    existingStream.endedAt = new Date();
    await existingStream.save();
  }

  const stream = await Stream.create({
    title: title.trim(),
    description: description?.trim() || "",
    host: req.user._id,
    isLive: true,
  });

  const populatedStream = await Stream.findById(stream._id).populate(
    "host",
    "username fullname avatar"
  );

  return res
    .status(201)
    .json(new apiresponse(201, populatedStream, "Stream started successfully"));
});

// End a livestream
const endStream = asyncHandler(async (req, res) => {
  const { streamId } = req.params;

  const stream = await Stream.findById(streamId);

  if (!stream) {
    throw new apierror("Stream not found", 404);
  }

  if (stream.host.toString() !== req.user._id.toString()) {
    throw new apierror("You are not authorized to end this stream", 403);
  }

  if (!stream.isLive) {
    throw new apierror("Stream is already ended", 400);
  }

  stream.isLive = false;
  stream.endedAt = new Date();
  await stream.save();

  return res
    .status(200)
    .json(new apiresponse(200, stream, "Stream ended successfully"));
});

// Get all live streams
const getLiveStreams = asyncHandler(async (req, res) => {
  const streams = await Stream.find({ isLive: true })
    .populate("host", "username fullname avatar")
    .sort({ startedAt: -1 });

  return res
    .status(200)
    .json(new apiresponse(200, streams, "Live streams fetched successfully"));
});

// Get stream by ID
const getStreamById = asyncHandler(async (req, res) => {
  const { streamId } = req.params;

  const stream = await Stream.findById(streamId).populate(
    "host",
    "username fullname avatar"
  );

  if (!stream) {
    throw new apierror("Stream not found", 404);
  }

  return res
    .status(200)
    .json(new apiresponse(200, stream, "Stream fetched successfully"));
});

// ==================== LIVE ROOM METHODS ====================

// Create live room for screen-share-voice
const createLiveRoom = asyncHandler(async (req, res) => {
  const { title, description, streamType } = req.body;

  if (!title?.trim()) {
    throw new apierror("Room title is required", 400);
  }

  // Check if user already has an active live room
  const existingRoom = await Stream.findOne({
    host: req.user._id,
    isLive: true,
    streamType: "screen-share-voice",
  });

  if (existingRoom) {
    throw new apierror("You already have an active live room. End it first.", 400);
  }

  const liveRoom = await Stream.create({
    title: title.trim(),
    description: description?.trim() || "",
    host: req.user._id,
    isLive: true,
    streamType: streamType || "screen-share-voice",
    participants: [],
  });

  const populatedRoom = await Stream.findById(liveRoom._id).populate(
    "host",
    "username fullname avatar"
  );

  return res
    .status(201)
    .json(new apiresponse(201, populatedRoom, "Live room created successfully"));
});

// Join live room (for WebRTC participants)
const joinLiveRoom = asyncHandler(async (req, res) => {
  const { streamId } = req.params;

  const room = await Stream.findById(streamId);

  if (!room) {
    throw new apierror("Live room not found", 404);
  }

  if (!room.isLive) {
    throw new apierror("Live room is not active", 400);
  }

  if (room.streamType !== "screen-share-voice") {
    throw new apierror("This is not a live room", 400);
  }

  // Check max participants
  if (room.participants.length >= (room["max-participants"] - 1)) {
    throw new apierror("Live room is full", 400);
  }

  // Check if already in room
  const alreadyJoined = room.participants.some(
    (p) => p.user.toString() === req.user._id.toString()
  );

  if (alreadyJoined) {
    throw new apierror("You are already in this room", 400);
  }

  // Add participant
  room.participants.push({
    user: req.user._id,
    joinedAt: new Date(),
    isMuted: false,
  });
  await room.save();

  const populatedRoom = await Stream.findById(streamId)
    .populate("host", "username fullname avatar")
    .populate("participants.user", "username fullname avatar");

  return res
    .status(200)
    .json(new apiresponse(200, populatedRoom, "Joined live room successfully"));
});

// Leave live room
const leaveLiveRoom = asyncHandler(async (req, res) => {
  const { streamId } = req.params;

  const room = await Stream.findById(streamId);

  if (!room) {
    throw new apierror("Live room not found", 404);
  }

  // Remove participant
  room.participants = room.participants.filter(
    (p) => p.user.toString() !== req.user._id.toString()
  );
  await room.save();

  return res
    .status(200)
    .json(new apiresponse(200, {}, "Left live room successfully"));
});

// Get live room details
const getLiveRoomDetails = asyncHandler(async (req, res) => {
  const { streamId } = req.params;

  const room = await Stream.findById(streamId)
    .populate("host", "username fullname avatar")
    .populate("participants.user", "username fullname avatar");

  if (!room) {
    throw new apierror("Live room not found", 404);
  }

  return res
    .status(200)
    .json(new apiresponse(200, room, "Live room details fetched successfully"));
});

// End live room
const endLiveRoom = asyncHandler(async (req, res) => {
  const { streamId } = req.params;

  const room = await Stream.findById(streamId);

  if (!room) {
    throw new apierror("Live room not found", 404);
  }

  if (room.host.toString() !== req.user._id.toString()) {
    throw new apierror("You are not authorized to end this room", 403);
  }

  if (!room.isLive) {
    throw new apierror("Live room is already ended", 400);
  }

  room.isLive = false;
  room.endedAt = new Date();
  room.roomstatus = "inactive";
  await room.save();

  return res
    .status(200)
    .json(new apiresponse(200, room, "Live room ended successfully"));
});

// Get all active live rooms
const getActiveLiveRooms = asyncHandler(async (req, res) => {
  const liveRooms = await Stream.find({
    isLive: true,
    streamType: "screen-share-voice",
    roomtype: "public",
  })
    .populate("host", "username fullname avatar")
    .populate("participants.user", "username fullname avatar")
    .sort({ startedAt: -1 });

  return res
    .status(200)
    .json(new apiresponse(200, liveRooms, "Active live rooms fetched successfully"));
});

// ==================== END LIVE ROOM METHODS ====================

// Join stream (increment viewer count)
const joinStream = asyncHandler(async (req, res) => {
  const { streamId } = req.params;

  const stream = await Stream.findById(streamId);

  if (!stream) {
    throw new apierror("Stream not found", 404);
  }

  if (!stream.isLive) {
    throw new apierror("Stream is not live", 400);
  }

  // Add viewer if not already in the list
  if (!stream.viewers.includes(req.user._id)) {
    stream.viewers.push(req.user._id);
    stream.viewerCount = stream.viewers.length;
    await stream.save();
  }

  const populatedStream = await Stream.findById(streamId)
    .populate("host", "username fullname avatar")
    .populate("viewers", "username fullname avatar");

  return res
    .status(200)
    .json(new apiresponse(200, populatedStream, "Joined stream successfully"));
});

// Leave stream (decrement viewer count)
const leaveStream = asyncHandler(async (req, res) => {
  const { streamId } = req.params;

  const stream = await Stream.findById(streamId);

  if (!stream) {
    throw new apierror("Stream not found", 404);
  }

  // Remove viewer from the list
  stream.viewers = stream.viewers.filter(
    (viewerId) => viewerId.toString() !== req.user._id.toString()
  );
  stream.viewerCount = stream.viewers.length;
  await stream.save();

  return res
    .status(200)
    .json(new apiresponse(200, {}, "Left stream successfully"));
});

// Toggle chat for stream
const toggleChat = asyncHandler(async (req, res) => {
  const { streamId } = req.params;

  const stream = await Stream.findById(streamId);

  if (!stream) {
    throw new apierror("Stream not found", 404);
  }

  if (stream.host.toString() !== req.user._id.toString()) {
    throw new apierror("You are not authorized to modify this stream", 403);
  }

  stream.chatEnabled = !stream.chatEnabled;
  await stream.save();

  return res
    .status(200)
    .json(new apiresponse(200, stream, `Chat ${stream.chatEnabled ? 'enabled' : 'disabled'} successfully`));
});

// Get user's stream history
const getStreamHistory = asyncHandler(async (req, res) => {
  const streams = await Stream.find({
    host: req.user._id,
  })
    .populate("host", "username fullname avatar")
    .sort({ startedAt: -1 });

  return res
    .status(200)
    .json(new apiresponse(200, streams, "Stream history fetched successfully"));
});

export {
  startStream,
  endStream,
  getLiveStreams,
  getStreamById,
  joinStream,
  leaveStream,
  toggleChat,
  getStreamHistory,
  // Live room exports
  createLiveRoom,
  joinLiveRoom,
  leaveLiveRoom,
  getLiveRoomDetails,
  endLiveRoom,
  getActiveLiveRooms,
};
