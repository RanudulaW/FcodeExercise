import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Post } from "@/models/Post";
import { Follow } from "@/models/Follow";
import { User } from "@/models/User";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const { content, mediaUrl } = await req.json();
    const authorId = (session.user as any).id;

    if (!content && !mediaUrl) {
      return sendError("Post must contain text or media", 400);
    }

    await connectToDatabase();

    const newPost = await Post.create({
      author: authorId,
      content: content || "",
      mediaUrl,
    });

    const populatedPost = await Post.findById(newPost._id).populate("author", "name headline profilePicture");

    return sendSuccess(populatedPost, "Post created successfully", 201);
  } catch (error: any) {
    console.error("Post creation error:", error);
    return sendError("Internal server error", 500, error);
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    // Find all users the current user is following
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const following = await Follow.find({ follower: userId }).select("following");
    const followingIds = following.map(f => f.following);

    // The feed should include posts from the user themselves AND people they follow
    const feedUserIds = [userId, ...followingIds];

    const posts = await Post.find({ author: { $in: feedUserIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name headline profilePicture")
      .lean();

    return sendSuccess({ posts, hasMore: posts.length === limit });
  } catch (error: any) {
    console.error("Feed fetch error:", error);
    return sendError("Internal server error", 500, error);
  }
}
