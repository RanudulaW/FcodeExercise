import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import { io } from "socket.io-client";

// Connect to our standalone socket server
const socket = io("http://localhost:3001");

export const createNotification = async (
  recipientId: string,
  senderId: string,
  type: 'like' | 'comment' | 'connection_request' | 'connection_accepted',
  entityId?: string
) => {
  // Don't notify yourself
  if (recipientId.toString() === senderId.toString()) return;

  try {
    // 1. Save to DB
    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      entityId,
    });

    // 2. Fetch sender name for socket payload
    const sender = await User.findById(senderId).select("name");

    // 3. Emit to socket server
    socket.emit("send_notification", {
      receiverId: recipientId,
      type,
      senderName: sender?.name || "Someone",
    });

  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
