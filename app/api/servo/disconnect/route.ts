import { NextResponse } from "next/server";
import { closeSerialPort, checkPortStatus } from "@/lib/serial";

export async function POST() {
  try {
    const portPath = process.env.ARDUINO_PORT || "COM6";
    
    // Check current status
    const status = await checkPortStatus(portPath);
    
    if (!status.open) {
      return NextResponse.json({
        success: true,
        message: `Port ${portPath} is already closed`,
        port: portPath,
      });
    }

    // Close the port
    await closeSerialPort();
    
    // Verify it's closed
    const newStatus = await checkPortStatus(portPath);
    
    return NextResponse.json({
      success: true,
      message: `Port ${portPath} disconnected successfully`,
      port: portPath,
      wasOpen: status.open,
    });
  } catch (error) {
    console.error("Error disconnecting port:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to disconnect",
      },
      { status: 500 }
    );
  }
}
