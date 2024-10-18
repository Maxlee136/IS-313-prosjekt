const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());

// Replace '/dev/cu.usbmodemDC5475C4F2602' with your Arduino's serial port path
const port = new SerialPort({
    path: '/dev/cu.usbmodemDC5475C4F2602', // Ensure this is the correct path
    baudRate: 19200, // Updated to match your Arduino code
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Variables to hold latest repetition count and sensor value
let repCount = 0;
let sensorValue = 0;

// When data is received from the Arduino
parser.on('data', (data) => {
    try {
        // Parse the data
        const sensorData = data.trim();

        // Check if the data includes a repetition count
        if (sensorData.startsWith("Repetition Count:")) {
            repCount = parseInt(sensorData.split(": ")[1], 10);
            console.log(`Repetition Count: ${repCount}`);
        } else if (sensorData.startsWith("Sensor Value:")) {
            sensorValue = parseInt(sensorData.split(": ")[1], 10);
            console.log(`Sensor Value: ${sensorValue}`);
        }

        // Emit both repCount and sensorValue together
        io.emit('arduino-data', { repCount, sensorValue });

    } catch (err) {
        console.error('Failed to parse data:', err);
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');
});

// Change the server port to 8080
server.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});
