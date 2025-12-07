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

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
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
