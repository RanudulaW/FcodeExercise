import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { Connection } from "@/models/Connection";
import { sendSuccess, sendError } from "@/lib/apiResponse";
import { createNotification } from "@/lib/notificationHelper";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string, skillName: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const resolvedParams = await params;
    const { id: profileUserId, skillName } = resolvedParams;
    const currentUserId = (session.user as any).id;
    const decodedSkillName = decodeURIComponent(skillName).toLowerCase();

    if (currentUserId === profileUserId) {
      return sendError("You cannot endorse your own skills", 400);
    }

    await connectToDatabase();

    // Verify they are connected
    const connection = await Connection.findOne({
      $or: [
        { sender: currentUserId, receiver: profileUserId },
        { sender: profileUserId, receiver: currentUserId }
      ],
      status: "accepted"
    });

    if (!connection) {
      return sendError("You must be connected to endorse skills", 403);
    }

    const user = await User.findById(profileUserId);
    if (!user) {
      return sendError("User not found", 404);
    }

    const skill = user.skills.find((s: any) => s.name.toLowerCase() === decodedSkillName);

    if (!skill) {
      return sendError("Skill not found", 404);
    }

    const endorsementIndex = skill.endorsements.findIndex(
      (e: any) => e.toString() === currentUserId
    );

    if (endorsementIndex > -1) {
      // Remove endorsement
      skill.endorsements.splice(endorsementIndex, 1);
    } else {
      // Add endorsement
      skill.endorsements.push(currentUserId);
      // We don't have a specific 'endorse' notification type defined yet, but we could add one later.
    }

    // Save
    user.markModified('skills');
    await user.save();

    return sendSuccess({ 
      skill: skill.name, 
      endorsementsCount: skill.endorsements.length,
      isEndorsed: endorsementIndex === -1
    }, endorsementIndex > -1 ? "Endorsement removed" : "Endorsed successfully");

  } catch (error: any) {
    console.error("Endorse skill error:", error);
    return sendError("Internal server error", 500, error);
  }
}
