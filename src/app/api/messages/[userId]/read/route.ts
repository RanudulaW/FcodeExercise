import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Message } from "@/models/Message";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function PUT(
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

    await connectToDatabase();

    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    return sendSuccess({}, "Messages marked as read");
  } catch (error: any) {
    console.error("Update messages read status error:", error);
    return sendError("Internal server error", 500, error);
  }
}
