import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Connection } from "@/models/Connection";
import { Follow } from "@/models/Follow";
import { sendSuccess, sendError } from "@/lib/apiResponse";
import { createNotification } from "@/lib/notificationHelper";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const { connectionId, action } = await req.json(); // action: "accept" | "reject"
    const userId = (session.user as any).id;

    if (!connectionId || !action || !['accept', 'reject'].includes(action)) {
      return sendError("Invalid request parameters", 400);
    }

    await connectToDatabase();

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return sendError("Connection request not found", 404);
    }

    // Only the receiver can accept/reject
    if (connection.receiver.toString() !== userId) {
      return sendError("Not authorized to respond to this request", 403);
    }

    if (connection.status !== "pending") {
      return sendError("Request is already processed", 400);
    }

    if (action === "accept") {
      connection.status = "accepted";
      await connection.save();

      // Auto follow back
      await Follow.findOneAndUpdate(
        { follower: connection.receiver, following: connection.sender },
        { follower: connection.receiver, following: connection.sender },
        { upsert: true }
      );
      await Follow.findOneAndUpdate(
        { follower: connection.sender, following: connection.receiver },
        { follower: connection.sender, following: connection.receiver },
        { upsert: true }
      );

      await createNotification(connection.sender.toString(), userId, "connection_accepted", connection._id.toString());

      return sendSuccess(connection, "Connection request accepted");
    } else {
      // Rejecting can either delete the request or mark as rejected
      // It's cleaner to delete it so they can retry later if needed
      await Connection.findByIdAndDelete(connectionId);
      return sendSuccess(null, "Connection request rejected");
    }

  } catch (error: any) {
    console.error("Connection respond error:", error);
    return sendError("Internal server error", 500, error);
  }
}
