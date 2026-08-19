import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Comment } from "@/models/Comment";
import { Post } from "@/models/Post";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function POST(
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
    const { content, parentComment } = await req.json();
    const authorId = (session.user as any).id;

    if (!postId || !content) {
      return sendError("Post ID and content are required", 400);
    }

    await connectToDatabase();

    const post = await Post.findById(postId);
    if (!post) {
      return sendError("Post not found", 404);
    }

    const newComment = await Comment.create({
      post: postId,
      author: authorId,
      content,
      parentComment: parentComment || null,
    });

    const populatedComment = await Comment.findById(newComment._id).populate("author", "name profilePicture");

    return sendSuccess(populatedComment, "Comment added successfully", 201);
  } catch (error: any) {
    console.error("Comment creation error:", error);
    return sendError("Internal server error", 500, error);
  }
}

export async function GET(
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

    if (!postId) {
      return sendError("Post ID is required", 400);
    }

    await connectToDatabase();

    // Fetch comments sorted by oldest first to show a chronological thread
    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .populate("author", "name profilePicture")
      .lean();

    return sendSuccess(comments);
  } catch (error: any) {
    console.error("Fetch comments error:", error);
    return sendError("Internal server error", 500, error);
  }
}
