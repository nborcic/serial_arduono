import { NextResponse } from "next/server";
import { getSerialPort, checkPortStatus } from "@/lib/serial";

export async function POST() {
  try {
    const portPath = process.env.ARDUINO_PORT || "COM6";
    
    // Check current status
    const status = await checkPortStatus(portPath);
    
    if (status.open && status.available) {
      return NextResponse.json({
        success: true,
        message: `Port ${portPath} is already open`,
        port: portPath,
      });
    }

    // Try to open the port
    await getSerialPort();
    
    // Verify it's open
    const newStatus = await checkPortStatus(portPath);
    
    if (newStatus.open) {
      return NextResponse.json({
        success: true,
        message: `Port ${portPath} opened successfully`,
        port: portPath,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to open port ${portPath}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error connecting to port:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to connect",
      },
      { status: 500 }
    );
  }
}
