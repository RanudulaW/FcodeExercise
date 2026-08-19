import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    if (!id) {
      return sendError("User ID is required", 400);
    }

    await connectToDatabase();
    
    // We populate connections here if needed, but for now just getting basic info
    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return sendError("User not found", 404);
    }

    return sendSuccess(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return sendError("Internal server error", 500, error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
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

