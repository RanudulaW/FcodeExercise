import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Connection } from "@/models/Connection";
import { sendSuccess, sendError } from "@/lib/apiResponse";

// Returns the list of users you can chat with (active connections)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const connections = await Connection.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted"
    }).populate("sender receiver", "name profilePicture headline").lean();

    const conversations = connections.map((conn: any) => {
      // The other person in the connection
      return conn.sender._id.toString() === userId ? conn.receiver : conn.sender;
    });

    return sendSuccess(conversations);
  } catch (error: any) {
    console.error("Fetch conversations error:", error);
    return sendError("Internal server error", 500, error);
  }
}
