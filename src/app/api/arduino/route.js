import { NextResponse } from 'next/server';
import { Server as IOServer } from 'socket.io';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

let io;

// Define the handler function for the API route
export async function GET(req) {
    const httpServer = req.socket.server;

    // Initialize Socket.io
    if (!io) {
        io = new IOServer(httpServer, {
            path: '/api/socketio',
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });

        console.log('Socket.io server initialized');
    }

    // Arduino SerialPort initialization
    const port = new SerialPort({
        path: '/dev/cu.usbmodemDC5475C4F2602', // Replace with your Arduino's serial port path
        baudRate: 19200, // Ensure this matches your Arduino configuration
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    // Handle data from Arduino
    parser.on('data', (data) => {
        try {
            const sensorData = data.trim();
            if (sensorData.startsWith('Repetition Count:')) {
                const repCount = parseInt(sensorData.split(': ')[1], 10);
                console.log(`Repetition Count: ${repCount}`);
                io?.emit('repCount', repCount); // Emit rep count to clients
            } else if (sensorData.startsWith('Sensor Value:')) {
                const sensorValue = parseInt(sensorData.split(': ')[1], 10);
                console.log(`Sensor Value: ${sensorValue}`);
                io?.emit('sensorValue', sensorValue); // Emit sensor value to clients
            }
        } catch (err) {
            console.error('Failed to parse data:', err);
        }
    });

    // Handle socket connection
    io.on('connection', () => {
        console.log('A user connected');
    });

    return NextResponse.json({ message: 'Arduino API Route Initialized' });
}
