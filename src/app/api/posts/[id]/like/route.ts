import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Post } from "@/models/Post";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const resolvedParams = await params;
    const { id: postId } = resolvedParams;
    const userId = (session.user as any).id;

    if (!postId) {
      return sendError("Post ID is required", 400);
    }

    await connectToDatabase();

    const post = await Post.findById(postId);
    if (!post) {
      return sendError("Post not found", 404);
    }

    const likeIndex = post.likes.findIndex((id: any) => id.toString() === userId);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    return sendSuccess(
      { likes: post.likes.length, isLiked: likeIndex === -1 }, 
      likeIndex > -1 ? "Post unliked" : "Post liked"
    );
  } catch (error: any) {
    console.error("Like toggle error:", error);
    return sendError("Internal server error", 500, error);
  }
}
