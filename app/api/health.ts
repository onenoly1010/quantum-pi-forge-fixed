import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: "healthy",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      deployment: "vercel-serverless",
      uptime: process.uptime(),
    },
    { status: 200 }
  );
}
