import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Message } from "@/models/Message";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const { receiverId, content } = await req.json();
    const senderId = (session.user as any).id;

    if (!receiverId || !content) {
      return sendError("Receiver and content are required", 400);
    }

    await connectToDatabase();

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    return sendSuccess(newMessage, "Message sent successfully", 201);
  } catch (error: any) {
    console.error("Message send error:", error);
    return sendError("Internal server error", 500, error);
  }
}
