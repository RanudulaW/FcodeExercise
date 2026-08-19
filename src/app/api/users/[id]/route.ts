import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { Connection } from "@/models/Connection";
import { Follow } from "@/models/Follow";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return sendError("User ID is required", 400);
    }

    await connectToDatabase();
    
    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return sendError("User not found", 404);
    }

    let networkStatus = {
      isFollowing: false,
      connectionStatus: "none" // "none", "pending", "accepted"
    };

    // If logged in, check network status
    const session = await getServerSession(authOptions);
    if (session && session.user) {
      const currentUserId = (session.user as any).id;
      
      if (currentUserId !== id) {
        const isFollowing = await Follow.exists({ follower: currentUserId, following: id });
        networkStatus.isFollowing = !!isFollowing;

        const connection = await Connection.findOne({
          $or: [
            { sender: currentUserId, receiver: id },
            { sender: id, receiver: currentUserId }
          ]
        });

        if (connection) {
          if (connection.status === "accepted") {
            networkStatus.connectionStatus = "accepted";
          } else if (connection.status === "pending") {
            // Check if we sent it or received it
            networkStatus.connectionStatus = connection.sender.toString() === currentUserId ? "pending_sent" : "pending_received";
          }
        }
      }
    }

    return sendSuccess({ ...user, networkStatus });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return sendError("Internal server error", 500, error);
  }
}
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    if (!id) {
      return sendError("User ID is required", 400);
    }

    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).select("-password").lean();

    if (!updatedUser) {
      return sendError("User not found", 404);
    }

    return sendSuccess(updatedUser, "Profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
    return sendError("Internal server error", 500, error);
  }
}

