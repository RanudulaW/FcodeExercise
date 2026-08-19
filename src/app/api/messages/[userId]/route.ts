import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Message } from "@/models/Message";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const resolvedParams = await params;
    const { userId: otherUserId } = resolvedParams;
    const currentUserId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return sendSuccess({ 
      messages: messages.reverse(), // Reverse to send chronological order to client
      hasMore: messages.length === limit 
    });
  } catch (error: any) {
    console.error("Fetch messages error:", error);
    return sendError("Internal server error", 500, error);
  }
}
