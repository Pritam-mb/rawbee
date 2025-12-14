import axios from "../lib/axios";

export interface LiveRoomData {
  title: string;
  description?: string;
  streamType?: "regular" | "screen-share-voice";
}

export interface LiveRoom {
  _id: string;
  title: string;
  description: string;
  host: {
    _id: string;
    username: string;
    fullname: string;
    avatar: string;
  };
  participants: Array<{
    user: {
      _id: string;
      username: string;
      fullname: string;
      avatar: string;
    };
    joinedAt: string;
    isMuted: boolean;
  }>;
  roomtype: "public" | "private" | "unlisted";
  "max-participants": number;
  roomstatus: "active" | "inactive";
  streamType: "regular" | "screen-share-voice";
  isLive: boolean;
  viewers: string[];
  viewerCount: number;
  startedAt: string;
  endedAt?: string;
  chatEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export const liveRoomService = {
  /**
   * Create a new live room
   */
  createLiveRoom: async (data: LiveRoomData): Promise<LiveRoom> => {
    const response = await axios.post("/stream/create-live-room", data);
    return response.data.data;
  },

  /**
   * Get active live rooms
   */
  getActiveLiveRooms: async (): Promise<LiveRoom[]> => {
    const response = await axios.get("/stream/live-rooms/active");
    return response.data.data;
  },

  /**
   * Get live room details by ID
   */
  getLiveRoomDetails: async (streamId: string): Promise<LiveRoom> => {
    const response = await axios.get(`/stream/live-room/${streamId}`);
    return response.data.data;
  },

  /**
   * Join a live room
   */
  joinLiveRoom: async (streamId: string): Promise<LiveRoom> => {
    const response = await axios.post(`/stream/live-room/${streamId}/join`);
    return response.data.data;
  },

  /**
   * Leave a live room
   */
  leaveLiveRoom: async (streamId: string): Promise<void> => {
    await axios.post(`/stream/live-room/${streamId}/leave`);
  },

  /**
   * End a live room (host only)
   */
  endLiveRoom: async (streamId: string): Promise<LiveRoom> => {
    const response = await axios.post(`/stream/live-room/${streamId}/end`);
    return response.data.data;
  },
};
