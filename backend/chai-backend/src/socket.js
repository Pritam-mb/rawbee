import { Server } from "socket.io";
import { Stream } from "./models/stream.model.js";

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    },
  });

  // Store room participants with their socket IDs
  const rooms = new Map(); // streamId -> { host: socketId, participants: [{userId, socketId, username, avatar, isMuted}] }

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join a stream room
    socket.on("join-stream", async ({ streamId, userId, username }) => {
      try {
        socket.join(streamId);
        console.log(`User ${username} joined stream ${streamId}`);

        // Update viewer count in database
        const stream = await Stream.findById(streamId);
        if (stream && stream.isLive) {
          if (!stream.viewers.includes(userId)) {
            stream.viewers.push(userId);
            stream.viewerCount = stream.viewers.length;
            await stream.save();
          }

          // Notify all users in the room about new viewer
          io.to(streamId).emit("viewer-joined", {
            userId,
            username,
            viewerCount: stream.viewerCount,
          });

          // Send current viewer count to the new user
          socket.emit("viewer-count", { viewerCount: stream.viewerCount });
        }
      } catch (error) {
        console.error("Error joining stream:", error);
        socket.emit("error", { message: "Failed to join stream" });
      }
    });

    // Leave a stream room
    socket.on("leave-stream", async ({ streamId, userId, username }) => {
      try {
        socket.leave(streamId);
        console.log(`User ${username} left stream ${streamId}`);

        // Update viewer count in database
        const stream = await Stream.findById(streamId);
        if (stream) {
          stream.viewers = stream.viewers.filter(
            (viewerId) => viewerId.toString() !== userId
          );
          stream.viewerCount = stream.viewers.length;
          await stream.save();

          // Notify all users in the room about viewer leaving
          io.to(streamId).emit("viewer-left", {
            userId,
            username,
            viewerCount: stream.viewerCount,
          });
        }
      } catch (error) {
        console.error("Error leaving stream:", error);
      }
    });

    // Send chat message
    socket.on("send-message", async ({ streamId, message, userId, username, avatar }) => {
      try {
        const stream = await Stream.findById(streamId);
        
        if (!stream) {
          socket.emit("error", { message: "Stream not found" });
          return;
        }

        if (!stream.chatEnabled) {
          socket.emit("error", { message: "Chat is disabled for this stream" });
          return;
        }

        const chatMessage = {
          id: Date.now(),
          userId,
          username,
          avatar,
          message,
          timestamp: new Date().toISOString(),
        };

        // Broadcast message to all users in the stream room
        io.to(streamId).emit("new-message", chatMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("host-created room",async({streamId})=>{
      socket.join(streamId);

    });

    // Host mutes a participant
    socket.on("mute-participant", ({ streamId, userId, isMuted }) => {
      io.to(streamId).emit("participant-muted", { userId, isMuted });
    });

    // Host toggles chat
    socket.on("toggle-chat", async ({ streamId, enabled }) => {
      io.to(streamId).emit("chat-toggled", { enabled });
    });

    // Stream ended by host
    socket.on("end-stream", async ({ streamId }) => {
      try {
        const stream = await Stream.findById(streamId);
        if (stream) {
          stream.isLive = false;
          stream.endedAt = new Date();
          await stream.save();

          // Notify all viewers that stream has ended
          io.to(streamId).emit("stream-ended");
        }
      } catch (error) {
        console.error("Error ending stream:", error);
      }
    });

    // ==================== LIVE ROOM WEBRTC EVENTS ====================

    // Host creates a live room
    socket.on("host-create-room", async ({ streamId, userId, username, avatar }) => {
      try {
        socket.join(streamId);
        
        // Initialize room data
        rooms.set(streamId, {
          host: { socketId: socket.id, userId, username, avatar },
          participants: []
        });

        console.log(`Host ${username} created live room ${streamId}`);
        socket.emit("room-created", { streamId, success: true });
      } catch (error) {
        console.error("Error creating room:", error);
        socket.emit("error", { message: "Failed to create room" });
      }
    });

    // Participant joins live room
    socket.on("participant-join-room", async ({ streamId, userId, username, avatar }) => {
      try {
        const room = rooms.get(streamId);
        
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        // Check max participants
        if (room.participants.length >= 5) { // 1 host + 5 participants = 6 total
          socket.emit("error", { message: "Room is full" });
          return;
        }

        socket.join(streamId);

        // Add participant to room
        const participant = {
          userId,
          socketId: socket.id,
          username,
          avatar,
          isMuted: false
        };
        room.participants.push(participant);

        console.log(`Participant ${username} joined room ${streamId}`);

        // Send room info to the new participant
        socket.emit("room-joined", {
          host: room.host,
          participants: room.participants.filter(p => p.userId !== userId)
        });

        // Notify host and all other participants about new user
        socket.to(streamId).emit("user-joined", {
          userId,
          username,
          avatar,
          socketId: socket.id
        });
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // WebRTC Signaling - Offer
    socket.on("webrtc-offer", ({ to, from, offer, streamId }) => {
      console.log(`Forwarding offer from ${from} to ${to}`);
      io.to(to).emit("webrtc-offer", { from, offer });
    });

    // WebRTC Signaling - Answer
    socket.on("webrtc-answer", ({ to, from, answer, streamId }) => {
      console.log(`Forwarding answer from ${from} to ${to}`);
      io.to(to).emit("webrtc-answer", { from, answer });
    });

    // WebRTC Signaling - ICE Candidate
    socket.on("ice-candidate", ({ to, candidate, streamId }) => {
      io.to(to).emit("ice-candidate", { candidate });
    });

    // Participant leaves room
    socket.on("leave-live-room", async ({ streamId, userId }) => {
      try {
        const room = rooms.get(streamId);
        if (!room) return;

        // Remove participant
        room.participants = room.participants.filter(p => p.userId !== userId);

        socket.leave(streamId);
        console.log(`User ${userId} left room ${streamId}`);

        // Notify everyone
        io.to(streamId).emit("user-left", { userId });
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    });

    // Toggle mute/unmute
    socket.on("toggle-mute", ({ streamId, userId, isMuted }) => {
      const room = rooms.get(streamId);
      if (room) {
        const participant = room.participants.find(p => p.userId === userId);
        if (participant) {
          participant.isMuted = isMuted;
        }
      }
      
      io.to(streamId).emit("participant-muted", { userId, isMuted });
      console.log(`User ${userId} is now ${isMuted ? 'muted' : 'unmuted'}`);
    });

    // Active speaker detection
    socket.on("speaking", ({ streamId, userId, isSpeaking }) => {
      socket.to(streamId).emit("user-speaking", { userId, isSpeaking });
    });

    // Host ends live room
    socket.on("end-live-room", ({ streamId }) => {
      console.log(`Host ending live room ${streamId}`);
      io.to(streamId).emit("room-ended");
      rooms.delete(streamId);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Clean up rooms
      rooms.forEach((room, streamId) => {
        // Check if disconnected user was host
        if (room.host.socketId === socket.id) {
          io.to(streamId).emit("room-ended");
          rooms.delete(streamId);
          console.log(`Room ${streamId} closed because host disconnected`);
          return;
        }

        // Check if disconnected user was participant
        const participantIndex = room.participants.findIndex(p => p.socketId === socket.id);
        if (participantIndex !== -1) {
          const participant = room.participants[participantIndex];
          room.participants.splice(participantIndex, 1);
          io.to(streamId).emit("user-left", { userId: participant.userId });
          console.log(`Participant ${participant.username} removed from room ${streamId}`);
        }
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
