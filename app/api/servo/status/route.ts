import { NextResponse } from "next/server";
import { checkPortStatus } from "@/lib/serial";

export async function GET() {
  try {
    const portPath = process.env.ARDUINO_PORT || "COM6";
    const status = await checkPortStatus(portPath);
    
    return NextResponse.json({
      success: true,
      port: portPath,
      ...status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to check port status",
      },
      { status: 500 }
    );
  }
}
