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

const port = new SerialPort({
    path: '/dev/cu.usbmodemDC5475C4F2602',
    baudRate: 19200,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

let repCount = 0;
let sensorValue = 0;
let isPaused = false;

parser.on('data', (data) => {
    try {
        const sensorData = data.trim();

        if (sensorData.startsWith("WorkoutEnded:")) {
            repCount = 0;
            sensorValue = 0;
            isPaused = false;
            io.emit('workoutEnded');
            io.emit('arduino-data', { repCount: 0, sensorValue: 0 });
            console.log('Workout ended, all counters reset');
        }
        else if (sensorData.startsWith("WorkoutPaused:")) {
            isPaused = true;
            io.emit('workoutPaused');
            console.log('Workout paused');
        }
        else if (sensorData.startsWith("WorkoutResumed:")) {
            isPaused = false;
            io.emit('workoutResumed');
            console.log('Workout resumed');
        }
        else if (sensorData.startsWith("RepsReset:")) {
            repCount = 0;
            io.emit('arduino-data', { repCount: 0, sensorValue });
            console.log('Reps reset acknowledged by Arduino');
        }
        else if (sensorData.startsWith("SensorValue:")) {
            const newSensorValue = parseInt(sensorData.split(":")[1], 10);
            if (!isNaN(newSensorValue)) {
                sensorValue = newSensorValue;
                // Always emit sensor value updates
                io.emit('arduino-data', { repCount, sensorValue });
                console.log(`Sensor Value: ${sensorValue}`);
            }
        }
        else if (sensorData.startsWith("RepCount:")) {
            if (!isPaused) {
                const newRepCount = parseInt(sensorData.split(":")[1], 10);
                if (!isNaN(newRepCount)) {
                    repCount = newRepCount;
                    io.emit('arduino-data', { repCount, sensorValue });
                    console.log(`Repetition Count: ${repCount}`);
                }
            }
        }
    } catch (err) {
        console.error('Failed to parse data:', err);
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send initial state to newly connected clients
    socket.emit('arduino-data', { repCount, sensorValue });

    socket.on('startWorkout', () => {
        console.log('Start workout command received');
        port.write('S');
        isPaused = false;
    });

    socket.on('pauseWorkout', () => {
        console.log('Pause workout command received');
        port.write('P');
    });

    socket.on('resumeWorkout', () => {
        console.log('Resume workout command received');
        port.write('S');
    });

    socket.on('nextSet', () => {
        console.log('Next set command received');
        port.write('N');
        isPaused = false;
    });

    socket.on('endWorkout', () => {
        console.log('End workout command received');
        port.write('E');
    });
});

server.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});