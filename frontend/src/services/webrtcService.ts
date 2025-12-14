import { Socket } from "socket.io-client";

// STUN server configuration for WebRTC
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

interface PeerConnection {
  connection: RTCPeerConnection;
  userId: string;
  username: string;
  stream?: MediaStream;
}

class WebRTCService {
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private socket: Socket | null = null;
  private isHost: boolean = false;

  // Callbacks for UI updates
  public onRemoteStream?: (userId: string, stream: MediaStream) => void;
  public onPeerConnected?: (userId: string) => void;
  public onPeerDisconnected?: (userId: string) => void;

  /**
   * Initialize WebRTC service with socket connection
   */
  init(socket: Socket, isHost: boolean) {
    this.socket = socket;
    this.isHost = isHost;
    this.setupSocketListeners();
  }

  /**
   * Setup Socket.io listeners for WebRTC signaling
   */
  private setupSocketListeners() {
    if (!this.socket) return;

    // When someone joins, create offer (if you're the host)
    this.socket.on("user-joined", async ({ userId, username, socketId }) => {
      console.log(`User joined: ${username} (${userId})`);
      
      if (this.isHost) {
        // Host creates offer for new participant
        await this.createPeerConnection(userId, username, socketId);
        await this.createOffer(userId, socketId);
      }
    });

    // Receive WebRTC offer
    this.socket.on("webrtc-offer", async ({ from, offer }) => {
      console.log(`Received offer from ${from}`);
      await this.handleOffer(from, offer);
    });

    // Receive WebRTC answer
    this.socket.on("webrtc-answer", async ({ from, answer }) => {
      console.log(`Received answer from ${from}`);
      await this.handleAnswer(from, answer);
    });

    // Receive ICE candidate
    this.socket.on("ice-candidate", async ({ candidate }) => {
      console.log(`Received ICE candidate`);
      // Find which peer this candidate is for (we'll improve this)
      // For now, add to all connections (not ideal, but works for small groups)
      for (const [userId, peer] of this.peerConnections) {
        try {
          await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    });

    // Handle user leaving
    this.socket.on("user-left", ({ userId }) => {
      console.log(`User left: ${userId}`);
      this.closePeerConnection(userId);
    });

    // Handle room ended
    this.socket.on("room-ended", () => {
      console.log("Room ended by host");
      this.cleanup();
    });
  }

  /**
   * Start screen sharing (HOST ONLY)
   */
  async startScreenShare(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
        } as MediaTrackConstraints,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } as MediaTrackConstraints,
      });

      this.localStream = stream;

      // Handle screen share stopped by user clicking browser's stop button
      stream.getVideoTracks()[0].onended = () => {
        console.log("Screen sharing stopped");
        this.stopLocalStream();
      };

      return stream;
    } catch (error) {
      console.error("Error starting screen share:", error);
      throw error;
    }
  }

  /**
   * Start microphone (PARTICIPANTS ONLY)
   */
  async startMicrophone(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error("Error starting microphone:", error);
      throw error;
    }
  }

  /**
   * Create peer connection for a user
   */
  private async createPeerConnection(
    userId: string,
    username: string,
    socketId: string
  ): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Add local stream tracks to connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit("ice-candidate", {
          to: socketId,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log(`Received remote stream from ${username}`);
      const remoteStream = event.streams[0];
      
      // Update peer connection with stream
      const peer = this.peerConnections.get(userId);
      if (peer) {
        peer.stream = remoteStream;
      }

      // Callback to update UI
      if (this.onRemoteStream) {
        this.onRemoteStream(userId, remoteStream);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state (${username}): ${peerConnection.connectionState}`);
      
      if (peerConnection.connectionState === "connected") {
        if (this.onPeerConnected) {
          this.onPeerConnected(userId);
        }
      } else if (
        peerConnection.connectionState === "disconnected" ||
        peerConnection.connectionState === "failed" ||
        peerConnection.connectionState === "closed"
      ) {
        if (this.onPeerDisconnected) {
          this.onPeerDisconnected(userId);
        }
      }
    };

    // Store peer connection
    this.peerConnections.set(userId, {
      connection: peerConnection,
      userId,
      username,
    });

    return peerConnection;
  }

  /**
   * Create and send WebRTC offer (HOST initiates)
   */
  private async createOffer(userId: string, socketId: string) {
    const peer = this.peerConnections.get(userId);
    if (!peer) return;

    try {
      const offer = await peer.connection.createOffer();
      await peer.connection.setLocalDescription(offer);

      if (this.socket) {
        this.socket.emit("webrtc-offer", {
          to: socketId,
          from: userId,
          offer: offer,
        });
      }
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }

  /**
   * Handle incoming WebRTC offer (PARTICIPANT receives)
   */
  private async handleOffer(fromSocketId: string, offer: RTCSessionDescriptionInit) {
    try {
      // Create peer connection if not exists
      let peer = Array.from(this.peerConnections.values()).find(
        (p) => p.userId === fromSocketId
      );

      if (!peer) {
        const peerConnection = await this.createPeerConnection(
          fromSocketId,
          "Host",
          fromSocketId
        );
        peer = this.peerConnections.get(fromSocketId)!;
      }

      // Set remote description
      await peer.connection.setRemoteDescription(new RTCSessionDescription(offer));

      // Create and send answer
      const answer = await peer.connection.createAnswer();
      await peer.connection.setLocalDescription(answer);

      if (this.socket) {
        this.socket.emit("webrtc-answer", {
          to: fromSocketId,
          from: peer.userId,
          answer: answer,
        });
      }
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  }

  /**
   * Handle incoming WebRTC answer (HOST receives)
   */
  private async handleAnswer(fromUserId: string, answer: RTCSessionDescriptionInit) {
    const peer = this.peerConnections.get(fromUserId);
    if (!peer) return;

    try {
      await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  }

  /**
   * Close specific peer connection
   */
  closePeerConnection(userId: string) {
    const peer = this.peerConnections.get(userId);
    if (peer) {
      peer.connection.close();
      this.peerConnections.delete(userId);
      
      if (this.onPeerDisconnected) {
        this.onPeerDisconnected(userId);
      }
    }
  }

  /**
   * Stop local stream
   */
  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  /**
   * Toggle microphone mute
   */
  toggleMute(isMuted: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get all peer connections
   */
  getPeerConnections(): Map<string, PeerConnection> {
    return this.peerConnections;
  }

  /**
   * Cleanup all connections
   */
  cleanup() {
    // Close all peer connections
    this.peerConnections.forEach((peer) => {
      peer.connection.close();
    });
    this.peerConnections.clear();

    // Stop local stream
    this.stopLocalStream();

    // Remove socket listeners
    if (this.socket) {
      this.socket.off("user-joined");
      this.socket.off("webrtc-offer");
      this.socket.off("webrtc-answer");
      this.socket.off("ice-candidate");
      this.socket.off("user-left");
      this.socket.off("room-ended");
    }
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService();
