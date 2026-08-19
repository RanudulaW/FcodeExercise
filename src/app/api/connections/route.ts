import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Connection } from "@/models/Connection";
import { User } from "@/models/User";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    // 1. Get pending requests (where user is the receiver)
    const pendingRequests = await Connection.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "name headline profilePicture");

    // 2. Get accepted connections (where user is either sender or receiver)
    const connections = await Connection.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted",
    }).populate("sender receiver", "name headline profilePicture");

    // Format connections so it's a flat list of users connected to the current user
    const formattedConnections = connections.map(conn => {
      // If the current user is the sender, the connection is the receiver, and vice versa
      const connectedUser = conn.sender._id.toString() === userId ? conn.receiver : conn.sender;
      return connectedUser;
    });

    // 3. Get suggestions (Random users not connected or requested)
    const allConnectedUserIds = connections.map(c => 
      c.sender._id.toString() === userId ? c.receiver._id : c.sender._id
    );
    const allPendingUserIds = await Connection.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).then(conns => conns.map(c => c.sender._id.toString() === userId ? c.receiver._id : c.sender._id));

    const excludeIds = [userId, ...allConnectedUserIds, ...allPendingUserIds];

    const suggestions = await User.find({
      _id: { $nin: excludeIds }
    })
      .limit(5)
      .select("name headline profilePicture");

    return sendSuccess({
      pendingRequests,
      connections: formattedConnections,
      suggestions,
    });

  } catch (error: any) {
    console.error("Fetch connections error:", error);
    return sendError("Internal server error", 500, error);
  }
}
