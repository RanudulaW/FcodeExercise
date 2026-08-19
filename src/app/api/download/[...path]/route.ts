import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    const pathArray = resolvedParams.path;
    
    if (!pathArray || pathArray.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    const requestedPath = path.join(uploadsDir, ...pathArray);

    // Security: Prevent path traversal attacks
    if (!requestedPath.startsWith(uploadsDir)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    try {
      const fileBuffer = await fs.readFile(requestedPath);
      const mimeType = getMimeType(requestedPath);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (err) {
      // File not found on disk
      return new NextResponse("File Not Found", { status: 404 });
    }
  } catch (error: any) {
    console.error("Download error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
