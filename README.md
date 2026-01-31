# Servo Motor Control App

A Next.js app to control an SG90 servo motor connected to Arduino via serial communication.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure Arduino port:
   - Copy `.env.local.example` to `.env.local`
   - Update `ARDUINO_PORT` with your COM port (Windows: COM3, COM4, etc. | Mac/Linux: /dev/tty.usbmodem14101, etc.)

3. Upload Arduino sketch:
   - Open `arduino/servo_control.ino` in Arduino IDE
   - Upload to your Arduino board
   - Connect servo motor:
     - Brown wire (GND) → GND
     - Red wire (VCC) → 5V
     - Orange wire (Signal) → Pin 8

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Control servo with 4 directions: Full Left, Left, Right, Full Right
- Visual feedback showing current servo position
- Serial port communication with Arduino
- Persistent serial connection (reuses port)

## Arduino Setup

The Arduino sketch listens for serial commands:
- `'F'` = Full Left (0°)
- `'L'` = Left (45°)
- `'R'` = Right (135°)
- `'G'` = Full Right (180°)

Default signal pin: 8. Change `SERVO_PIN` in the sketch to use a different pin.
