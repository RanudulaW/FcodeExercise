import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { sendSuccess, sendError } from "@/lib/apiResponse";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return sendError("Missing required fields", 400);
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return sendError("User already exists with this email", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return sendSuccess({ userId: newUser._id }, "User created successfully", 201);
  } catch (error) {
    console.error("Registration error:", error);
    return sendError("Internal server error", 500, error);
  }
}

