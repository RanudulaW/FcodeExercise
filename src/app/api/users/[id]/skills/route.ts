import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
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
    const { id } = resolvedParams;
    const currentUserId = (session.user as any).id;

    if (currentUserId !== id) {
      return sendError("You can only add skills to your own profile", 403);
    }

    const { name } = await req.json();

    if (!name || !name.trim()) {
      return sendError("Skill name is required", 400);
    }

    await connectToDatabase();

    const user = await User.findById(id);
    if (!user) {
      return sendError("User not found", 404);
    }

    // Check if skill already exists (case-insensitive)
    const existingSkill = user.skills.find(
      (s: any) => s.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existingSkill) {
      return sendError("Skill already exists", 400);
    }

    user.skills.push({ name: name.trim(), endorsements: [] });
    await user.save();

    return sendSuccess(user.skills, "Skill added successfully", 201);
  } catch (error: any) {
    console.error("Add skill error:", error);
    return sendError("Internal server error", 500, error);
  }
}
