// Dynamic import to avoid webpack bundling issues with native modules
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SerialPort: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let port: any = null;

async function getSerialPortModule() {
  if (!SerialPort) {
    SerialPort = (await import("serialport")).SerialPort;
  }
  return SerialPort;
}

/**
 * Check if COM6 port is available and open
 */
export async function checkPortStatus(portPath: string = "COM6"): Promise<{
  available: boolean;
  open: boolean;
  inUse: boolean;
  error?: string;
}> {
  const SerialPortClass = await getSerialPortModule();
  
  try {
    // Try to list available ports to check if COM6 exists
    const ports = await SerialPortClass.list();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const portExists = ports.some((p: any) => p.path === portPath);
    
    if (!portExists) {
      return {
        available: false,
        open: false,
        inUse: false,
        error: `Port ${portPath} not found`,
      };
    }

    // Check if our port instance exists and is open
    if (port) {
      const isOpen = port.isOpen;
      return {
        available: true,
        open: isOpen,
        inUse: isOpen,
      };
    }

    return {
      available: true,
      open: false,
      inUse: false,
    };
  } catch (err) {
    return {
      available: false,
      open: false,
      inUse: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Force disconnect and cleanup port if it's closed or in use
 */
export async function disconnectIfNeeded(portPath: string = "COM6"): Promise<void> {
  if (port) {
    try {
      const status = await checkPortStatus(portPath);
      
      // If port is closed or not available, cleanup
      if (!status.open || !status.available) {
        console.log(`Port ${portPath} is closed or unavailable, cleaning up...`);
        await closeSerialPort();
      } else if (status.inUse && port.isOpen) {
        // Check if port is actually writable (not in use by another process)
        try {
          // Try a test write to see if port is actually usable
          port.write(""); // Empty write to test
        } catch {
          console.log(`Port ${portPath} appears to be in use by another process, closing...`);
          await closeSerialPort();
        }
      }
    } catch (err) {
      console.error("Error checking port status:", err);
      // Force cleanup on error
      await closeSerialPort();
    }
  }
}

export async function getSerialPort() {
  const comPort = process.env.ARDUINO_PORT || "COM6";
  const baudRate = parseInt(process.env.ARDUINO_BAUD_RATE || "9600");

  // Check and cleanup if needed before opening
  await disconnectIfNeeded(comPort);

  // If port exists and is open, return it
  if (port && port.isOpen) {
    return port;
  }

  const SerialPortClass = await getSerialPortModule();

  // Check port status before attempting to open
  const status = await checkPortStatus(comPort);
  
  if (!status.available) {
    throw new Error(`Port ${comPort} is not available: ${status.error || "Port not found"}`);
  }

  if (status.inUse && port) {
    // Port exists but might be in use, try to close it first
    await closeSerialPort();
  }

  // Create new port instance
  port = new SerialPortClass({
    path: comPort,
    baudRate,
    autoOpen: false,
  });

  // Add error handlers
  port.on("error", (err: Error) => {
    console.error(`Serial port ${comPort} error:`, err);
    // Auto-cleanup on error
    if (err.message.includes("Access denied") || err.message.includes("in use")) {
      console.log(`Port ${comPort} is in use, cleaning up...`);
      closeSerialPort();
    }
  });

  port.on("close", () => {
    console.log(`Serial port ${comPort} closed`);
    port = null;
  });

  try {
    await port.open();
    console.log(`Serial port ${comPort} opened successfully`);
    return port;
  } catch (err) {
    console.error(`Failed to open serial port ${comPort}:`, err);
    
    // Handle specific error cases
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes("Access denied") || errorMessage.includes("in use")) {
      port = null;
      throw new Error(`Port ${comPort} is in use by another application`);
    }
    
    port = null;
    throw err;
  }
}

export async function sendCommand(command: string): Promise<void> {
  try {
    // Check port status before sending command
    const comPort = process.env.ARDUINO_PORT || "COM6";
    await disconnectIfNeeded(comPort);
    
    const serialPort = await getSerialPort();
    
    // Verify port is still open before writing
    if (!serialPort.isOpen) {
      throw new Error("Port is not open");
    }
    
    serialPort.write(command);
    await new Promise<void>((resolve, reject) => {
      serialPort.drain((err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (err) {
    console.error("Failed to write to serial port:", err);
    // Cleanup on write error
    const comPort = process.env.ARDUINO_PORT || "COM6";
    await disconnectIfNeeded(comPort);
    throw err;
  }
}

export async function closeSerialPort(): Promise<void> {
  if (port && port.isOpen) {
    try {
      await port.close();
      console.log("Serial port closed");
    } catch (err) {
      console.error("Error closing serial port:", err);
    }
    port = null;
  }
}
