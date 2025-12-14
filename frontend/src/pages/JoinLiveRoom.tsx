import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { liveRoomService } from "../services/liveRoomService";
import { webrtcService } from "../services/webrtcService";
import { socketService } from "../services/socketService";
import { useAuthStore } from "../store/authStore";

/**
 * EXAMPLE: Participant Join Live Room Component
 * This shows how a participant joins and sees host's screen + talks
 */
export default function JoinLiveRoom() {
  const { streamId } = useParams<{ streamId: string }>();
  const [room, setRoom] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [hostStream, setHostStream] = useState<MediaStream | null>(null);
  
  const hostVideoRef = useRef<HTMLVideoElement>(null);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    loadRoomDetails();

    return () => {
      if (isJoined) {
        handleLeaveRoom();
      }
    };
  }, []);

  /**
   * Step 1: Load room details
   */
  const loadRoomDetails = async () => {
    if (!streamId) return;

    try {
      const roomData = await liveRoomService.getLiveRoomDetails(streamId);
      setRoom(roomData);
      
      if (!roomData.isLive) {
        alert("This room is not active");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Error loading room:", error);
      alert(error.response?.data?.message || "Failed to load room");
      navigate("/");
    }
  };

  /**
   * Step 2: Join the room
   */
  const handleJoinRoom = async () => {
    if (!streamId) return;

    setIsJoining(true);
    try {
      // 1. Join room via API
      await liveRoomService.joinLiveRoom(streamId);

      // 2. Start microphone
      await webrtcService.startMicrophone();

      // 3. Connect to Socket.io
      const socket = socketService.getSocket();

      // 4. Initialize WebRTC (as PARTICIPANT, not host)
      webrtcService.init(socket, false);

      // 5. Setup callbacks
      webrtcService.onRemoteStream = (userId, remoteStream) => {
        console.log(`Received stream from ${userId}`);
        // If this is the host's stream (screen share)
        setHostStream(remoteStream);
        
        if (hostVideoRef.current) {
          hostVideoRef.current.srcObject = remoteStream;
        }
      };

      webrtcService.onPeerConnected = (userId) => {
        console.log(`Connected to ${userId}`);
      };

      webrtcService.onPeerDisconnected = (userId) => {
        console.log(`Disconnected from ${userId}`);
      };

      // 6. Join Socket.io room
      socket.emit("participant-join-room", {
        streamId,
        userId: user?._id,
        username: user?.username,
        avatar: user?.avatar,
      });

      // 7. Listen for room joined confirmation
      socket.on("room-joined", ({ host, participants: existingParticipants }) => {
        console.log("Joined room successfully");
        setParticipants(existingParticipants);
        setIsJoined(true);
        setIsJoining(false);
      });

      // 8. Listen for new users joining
      socket.on("user-joined", ({ userId, username, avatar }) => {
        console.log(`${username} joined`);
        setParticipants((prev) => [...prev, { userId, username, avatar }]);
      });

      // 9. Listen for users leaving
      socket.on("user-left", ({ userId }) => {
        setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      });

      // 10. Listen for room ended by host
      socket.on("room-ended", () => {
        alert("Host ended the room");
        handleLeaveRoom();
      });

      // 11. Listen for mute status changes
      socket.on("participant-muted", ({ userId, isMuted }) => {
        console.log(`User ${userId} is ${isMuted ? "muted" : "unmuted"}`);
      });

    } catch (error: any) {
      console.error("Error joining room:", error);
      alert(error.response?.data?.message || "Failed to join room");
      setIsJoining(false);
    }
  };

  /**
   * Step 3: Leave the room
   */
  const handleLeaveRoom = async () => {
    if (!streamId) return;

    try {
      // 1. Leave via Socket.io
      const socket = socketService.getSocket();
      socket.emit("leave-live-room", {
        streamId,
        userId: user?._id,
      });

      // 2. Leave via API
      await liveRoomService.leaveLiveRoom(streamId);

      // 3. Cleanup WebRTC
      webrtcService.cleanup();

      // 4. Navigate away
      navigate("/");
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  /**
   * Toggle microphone mute
   */
  const handleToggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);

    // Update local audio track
    webrtcService.toggleMute(newMuteState);

    // Notify others
    const socket = socketService.getSocket();
    socket.emit("toggle-mute", {
      streamId,
      userId: user?._id,
      isMuted: newMuteState,
    });
  };

  if (!room) {
    return <div className="p-6">Loading room...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{room.title}</h1>
      <p className="text-gray-600 mb-4">{room.description}</p>

      {!isJoined ? (
        <div>
          <div className="mb-4">
            <p className="mb-2">Host: {room.host.username}</p>
            <p className="mb-2">
              Participants: {room.participants.length} / {room["max-participants"]}
            </p>
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={isJoining}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isJoining ? "Joining..." : "Join Room"}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">
              Watching {room.host.username}'s screen
            </h2>
          </div>

          {/* Host's screen */}
          <div className="mb-4">
            <video
              ref={hostVideoRef}
              autoPlay
              className="w-full max-w-3xl border rounded"
            />
          </div>

          {/* Participants list */}
          <div className="mb-4">
            <h3 className="font-bold mb-2">In this room:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-blue-100 rounded">
                <img src={room.host.avatar} alt="" className="w-8 h-8 rounded-full" />
                <span>{room.host.username} (Host)</span>
              </div>
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
              className={`px-4 py-2 rounded ${
                isMuted
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={handleLeaveRoom}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Leave Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
