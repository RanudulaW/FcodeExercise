import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { UploadFactory } from "@/lib/upload/UploadFactory";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return sendError("Unauthorized. Please log in to upload files.", 401);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return sendError("No file provided", 400);
    }

    if (!type) {
      return sendError("Upload type not specified", 400);
    }

    const strategy = UploadFactory.getStrategy(type);
    const filePath = await strategy.save(file);

    return sendSuccess({ path: filePath }, "File uploaded successfully", 201);
  } catch (error: any) {
    console.error("Upload error:", error);
    return sendError(error.message || "Failed to upload file", 500, error);
  }
}
