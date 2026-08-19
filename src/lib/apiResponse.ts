import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export function sendSuccess<T>(data: T, message: string = "Success", status: number = 200) {
  return NextResponse.json(
    { success: true, message, data } as ApiResponse<T>,
    { status }
  );
}

export function sendError(message: string, status: number = 400, error?: any) {
  return NextResponse.json(
    { success: false, message, error } as ApiResponse<any>,
    { status }
  );
}
