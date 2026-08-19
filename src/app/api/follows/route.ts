import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Follow } from "@/models/Follow";
import { User } from "@/models/User";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const { targetId } = await req.json();
    const followerId = (session.user as any).id;

    if (!targetId) {
      return sendError("Target ID is required", 400);
    }

    if (followerId === targetId) {
      return sendError("You cannot follow yourself", 400);
    }

    await connectToDatabase();

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return sendError("User not found", 404);
    }

    // Toggle logic: If following, unfollow. If not following, follow.
    const existingFollow = await Follow.findOne({ follower: followerId, following: targetId });

    if (existingFollow) {
      await Follow.findByIdAndDelete(existingFollow._id);
      return sendSuccess({ isFollowing: false }, "Unfollowed successfully");
    } else {
      await Follow.create({ follower: followerId, following: targetId });
      return sendSuccess({ isFollowing: true }, "Followed successfully", 201);
    }

  } catch (error: any) {
    console.error("Follow toggle error:", error);
    return sendError("Internal server error", 500, error);
  }
}
