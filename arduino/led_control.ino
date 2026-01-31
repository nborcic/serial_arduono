// LED Control via Serial Communication
// Receives '1' to turn LED ON, '0' to turn LED OFF

const int LED_PIN = 13; // Change this to your LED pin
const int BAUD_RATE = 9600;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(BAUD_RATE);
  digitalWrite(LED_PIN, LOW); // Start with LED off
}

void loop() {
  if (Serial.available() > 0) {
    char command = Serial.read();
    
    if (command == '1') {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED ON");
    } else if (command == '0') {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED OFF");
    }
  }
}
