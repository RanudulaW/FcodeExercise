import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Connection } from "@/models/Connection";
import { Follow } from "@/models/Follow";
import { User } from "@/models/User";
import { sendSuccess, sendError } from "@/lib/apiResponse";
import { createNotification } from "@/lib/notificationHelper";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const { receiverId } = await req.json();
    const senderId = (session.user as any).id;

    if (!receiverId) {
      return sendError("Receiver ID is required", 400);
    }

    if (senderId === receiverId) {
      return sendError("You cannot connect with yourself", 400);
    }

    await connectToDatabase();

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return sendError("User not found", 404);
    }

    // Check if connection already exists in any direction
    const existingConnection = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingConnection) {
      return sendError("Connection request already exists", 409);
    }

    // Create the connection request
    const newConnection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    // Auto-follow when sending a connection request
    await Follow.findOneAndUpdate(
      { follower: senderId, following: receiverId },
      { follower: senderId, following: receiverId },
      { upsert: true, new: true }
    );

    await createNotification(receiverId, senderId, "connection_request", newConnection._id.toString());

    return sendSuccess(newConnection, "Connection request sent", 201);
  } catch (error: any) {
    console.error("Connection request error:", error);
    return sendError("Internal server error", 500, error);
  }
}
