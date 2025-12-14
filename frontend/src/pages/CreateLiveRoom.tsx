import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { liveRoomService } from "../services/liveRoomService";
import { webrtcService } from "../services/webrtcService";
import { socketService } from "../services/socketService";
import { useAuthStore } from "../store/authStore";

/**
 * EXAMPLE: Host Create Live Room Component
 * This shows you how to use the WebRTC services
 */
export default function CreateLiveRoom() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (isStreaming) {
        handleEndRoom();
      }
    };
  }, [isStreaming]);

  /**
   * Step 1: Create live room via API
   */
  const handleCreateRoom = async () => {
    if (!title.trim()) {
      alert("Please enter a room title");
      return;
    }

    setIsCreating(true);
    try {
      // 1. Create room in database
      const room = await liveRoomService.createLiveRoom({
        title,
        description,
        streamType: "screen-share-voice",
      });

      console.log("Room created:", room);
      setRoomId(room._id);

      // 2. Start screen sharing
      await startScreenShare(room._id);

    } catch (error: any) {
      console.error("Error creating room:", error);
      alert(error.response?.data?.message || "Failed to create room");
      setIsCreating(false);
    }
  };

  /**
   * Step 2: Start screen share and connect to Socket.io
   */
  const startScreenShare = async (streamId: string) => {
    try {
      // 1. Start screen capture
      const stream = await webrtcService.startScreenShare();
      
      // Display local screen preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // 2. Connect to Socket.io
      const socket = socketService.getSocket();
      
      // 3. Initialize WebRTC with socket (as HOST)
      webrtcService.init(socket, true);

      // 4. Setup callbacks for UI updates
      webrtcService.onRemoteStream = (userId, remoteStream) => {
        console.log(`Received stream from participant ${userId}`);
        // You would add this to your participants list with audio element
      };

      webrtcService.onPeerConnected = (userId) => {
        console.log(`Participant ${userId} connected`);
      };

      webrtcService.onPeerDisconnected = (userId) => {
        console.log(`Participant ${userId} disconnected`);
        setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      };

      // 5. Join Socket.io room as host
      socket.emit("host-create-room", {
        streamId,
        userId: user?._id,
        username: user?.username,
        avatar: user?.avatar,
      });

      // 6. Listen for room created confirmation
      socket.on("room-created", ({ success }) => {
        if (success) {
          console.log("Socket room created successfully");
          setIsStreaming(true);
          setIsCreating(false);
        }
      });

      // 7. Listen for new participants joining
      socket.on("user-joined", ({ userId, username, avatar }) => {
        console.log(`${username} joined the room`);
        setParticipants((prev) => [...prev, { userId, username, avatar }]);
      });

      // 8. Listen for participants leaving
      socket.on("user-left", ({ userId }) => {
        setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      });

    } catch (error) {
      console.error("Error starting screen share:", error);
      alert("Failed to start screen sharing. Please allow screen access.");
      setIsCreating(false);
    }
  };

  /**
   * Step 3: End the live room
   */
  const handleEndRoom = async () => {
    if (!roomId) return;

    try {
      // 1. Notify via Socket.io
      const socket = socketService.getSocket();
      socket.emit("end-live-room", { streamId: roomId });

      // 2. End room in database
      await liveRoomService.endLiveRoom(roomId);

      // 3. Cleanup WebRTC
      webrtcService.cleanup();

      // 4. Reset state
      setIsStreaming(false);
      setRoomId(null);
      setParticipants([]);

      alert("Room ended successfully");
      navigate("/");
    } catch (error) {
      console.error("Error ending room:", error);
    }
  };

  /**
   * Toggle microphone mute
   */
  const handleToggleMute = () => {
    const socket = socketService.getSocket();
    const isMuted = true; // Track this in state
    
    webrtcService.toggleMute(isMuted);
    
    socket.emit("toggle-mute", {
      streamId: roomId,
      userId: user?._id,
      isMuted,
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Live Room</h1>

      {!isStreaming ? (
        <div className="max-w-md">
          <div className="mb-4">
            <label className="block mb-2">Room Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter room title"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="What are you streaming?"
              rows={3}
            />
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Start Live Room"}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">You're Live!</h2>
            <p className="text-gray-600">Room ID: {roomId}</p>
            <p className="text-gray-600">Participants: {participants.length}</p>
          </div>

          {/* Screen preview */}
          <div className="mb-4">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full max-w-3xl border rounded"
            />
          </div>

          {/* Participants list */}
          <div className="mb-4">
            <h3 className="font-bold mb-2">Participants:</h3>
            <div className="space-y-2">
              {participants.map((p) => (
                <div key={p.userId} className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                  <img src={p.avatar} alt="" className="w-8 h-8 rounded-full" />
                  <span>{p.username}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleToggleMute}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Toggle Mute
            </button>
            <button
              onClick={handleEndRoom}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              End Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
