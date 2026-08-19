import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Notification } from "@/models/Notification";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name profilePicture")
      .lean();

    return sendSuccess(notifications);
  } catch (error: any) {
    console.error("Notifications fetch error:", error);
    return sendError("Internal server error", 500, error);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    // Mark all as read
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return sendSuccess({}, "Notifications marked as read");
  } catch (error: any) {
    console.error("Notifications update error:", error);
    return sendError("Internal server error", 500, error);
  }
}
