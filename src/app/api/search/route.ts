import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendError("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return sendSuccess([]);
    }

    await connectToDatabase();

    // Case-insensitive regex search on name or headline
    const regex = new RegExp(query, "i");
    const users = await User.find({
      $or: [{ name: regex }, { headline: regex }]
    })
      .limit(20)
      .select("name headline profilePicture")
      .lean();

    return sendSuccess(users);
  } catch (error: any) {
    console.error("Search error:", error);
    return sendError("Internal server error", 500, error);
  }
}
