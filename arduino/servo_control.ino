// SG90 Servo Control via Serial Communication
// 
// SG90 Specifications:
// - PWM Frequency: 50 Hz (20 ms period)
// - Pulse Width Range: 1 ms (0°) to 2 ms (180°)
// - Center Position: 1.5 ms (90°)
// - Rotation Angle: 180°
// 
// Wire Connections:
// A - Brown wire → GND
// B - Red wire → 5V
// C - Orange wire → Pin 8 (PWM signal)
//
// Commands:
// 'F' = Full Left (0°) → 1 ms pulse
// 'L' = Left (45°) → ~1.25 ms pulse
// 'C' = Center (90°) → 1.5 ms pulse
// 'R' = Right (135°) → ~1.75 ms pulse
// 'G' = Full Right (180°) → 2 ms pulse

#include <Servo.h>

const int SERVO_PIN = 8;
const int BAUD_RATE = 9600;

Servo myServo;

void setup() {
  Serial.begin(BAUD_RATE);
  myServo.attach(SERVO_PIN);
  // Servo library automatically converts angle to PWM pulse width:
  // 0° = 1 ms pulse, 90° = 1.5 ms pulse, 180° = 2 ms pulse
  myServo.write(90); // Start at center position (1.5 ms pulse)
  Serial.println("SG90 Servo ready - Center position (90°)");
}

void loop() {
  if (Serial.available() > 0) {
    char command = Serial.read();
    
    switch (command) {
      case 'F': // Full Left - 0° (1 ms pulse)
        myServo.write(0);
        Serial.println("Full Left (0°) - PWM: 1 ms");
        break;
      case 'L': // Left - 45° (~1.25 ms pulse)
        myServo.write(45);
        Serial.println("Left (45°) - PWM: ~1.25 ms");
        break;
      case 'C': // Center - 90° (1.5 ms pulse)
        myServo.write(90);
        Serial.println("Center (90°) - PWM: 1.5 ms");
        break;
      case 'R': // Right - 135° (~1.75 ms pulse)
        myServo.write(135);
        Serial.println("Right (135°) - PWM: ~1.75 ms");
        break;
      case 'G': // Full Right - 180° (2 ms pulse)
        myServo.write(180);
        Serial.println("Full Right (180°) - PWM: 2 ms");
        break;
      default:
        Serial.println("Unknown command. Use: F(fullleft), L(left), C(center), R(right), G(fullright)");
        break;
    }
  }
}
