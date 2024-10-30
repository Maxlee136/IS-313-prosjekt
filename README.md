# KOM IGANG MED PROSJEKTET

1. Lag en mappe på pcen kallt is-313-prosjekt
2. Start med å kjøre git clone i  også  for å klone repoistory til din lokale datamaskin

# Requirements
- Node må være installert på pc - en
- Arduino IDE for å kunne kjøre arduino koden



Når du har klonet repository sørg for at du er i is-313-prosjekt mappen

### 
Kjør kommandoen i is-313-prosjekt mappen for å sørge for at du har nyeste versjon av node modules.
```
npm install
```
Kjør dermed

```
npm run dev
```
Appen vil nå kjør i utviklermodus
Åpne [http://localhost:3000](http://localhost:3000)


###
Arduino kode:
```
// Constants
const int muscleSensorPin = A0;
const int threshold = 600;
const int lowerThreshold = 300;
const unsigned long debounceDelay = 50;

// Variables
int sensorValue = 0;
int repetitionCount = 0;
bool lastState = false;
unsigned long lastDebounceTime = 0;
bool resetRepetitions = false;
bool isPaused = false;

void setup() {
    Serial.begin(19200);
    pinMode(muscleSensorPin, INPUT);
    
    Serial.println("Calibrating...");
    delay(2000);
    Serial.println("Calibration done. Starting repetitions count...");
}

void loop() {
    // Always read sensor value first
    sensorValue = analogRead(muscleSensorPin);
    
    // Check for commands from the React app
    if (Serial.available() > 0) {
        char command = Serial.read();
        switch(command) {
            case 'R': // Reset
                resetRepetitions = true;
                Serial.println("RepsReset:0");
                break;
            case 'E': // End workout
                resetRepetitions = true;
                repetitionCount = 0;
                isPaused = false;
                Serial.println("WorkoutEnded:0");
                Serial.println("RepsReset:0");
                break;
            case 'P': // Pause
                isPaused = true;
                Serial.println("WorkoutPaused:1");
                break;
            case 'S': // Start/Resume
                isPaused = false;
                Serial.println("WorkoutResumed:1");
                break;
            case 'N': // Next set
                resetRepetitions = true;
                Serial.println("RepsReset:0");
                Serial.println("WorkoutResumed:1");
                break;
        }
    }

    // Reset repetition count if needed
    if (resetRepetitions) {
        repetitionCount = 0;
        resetRepetitions = false;
        Serial.println("New set started, repetition count reset.");
    }

    // Process repetitions only if not paused
    if (!isPaused && sensorValue > threshold) {
        unsigned long currentTime = millis();
        if (!lastState && (currentTime - lastDebounceTime) > debounceDelay) {
            repetitionCount++;
            lastDebounceTime = currentTime;
            Serial.print("Repetition Count: ");
            Serial.println(repetitionCount);
        }
        lastState = true;
    }
    else if (sensorValue < lowerThreshold) {
        lastState = false;
    }

    // Always send the current sensor value and rep count
    Serial.print("SensorValue:");
    Serial.println(sensorValue);
    Serial.print("RepCount:");
    Serial.println(repetitionCount);
    
    delay(100);
}
```


