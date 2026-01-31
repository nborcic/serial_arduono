import { NextRequest, NextResponse } from "next/server";
import { sendCommand } from "@/lib/serial";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { direction } = body;

    // Map direction to servo commands: 'F' = Full Left, 'L' = Left, 'R' = Right, 'G' = Full Right
    const commandMap: Record<string, string> = {
      fullleft: "F",
      left: "L",
      right: "R",
      fullright: "G",
    };

    const command = commandMap[direction];
    if (!command) {
      return NextResponse.json(
        { success: false, error: "Invalid direction" },
        { status: 400 }
      );
    }

    await sendCommand(command);

    console.log(`Servo ${direction} - Sent command: ${command}`);

    return NextResponse.json({ success: true, direction });
  } catch (error) {
    console.error("Error controlling servo:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to control servo" 
      },
      { status: 500 }
    );
  }
}
