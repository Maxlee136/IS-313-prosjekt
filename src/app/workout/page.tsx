"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Line } from 'react-chartjs-2';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Play, Pause, SkipForward, StopCircle } from 'lucide-react';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

let socket: Socket;

export default function WorkoutDashboard() {
    const [repCount, setRepCount] = useState<number>(0);
    const [sensorValue, setSensorValue] = useState<number>(0);
    const [setCount, setSetCount] = useState<number>(0);
    const [muscleActivation, setMuscleActivation] = useState<number[]>([]);
    const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [totalReps, setTotalReps] = useState<number>(0);


    const handleStartWorkout = () => {
        setIsWorkoutActive(true);
        setIsPaused(false);
        setRepCount(0);
        setSetCount(0);
        setTotalReps(0);
        setMuscleActivation([]);
        socket.emit('startWorkout');
    };

    const handlePauseResume = () => {
        setIsPaused(!isPaused);
        socket.emit(isPaused ? 'resumeWorkout' : 'pauseWorkout');
    };

    const handleNextSet = () => {
        setSetCount((prev) => prev + 1);
        setRepCount(0);
        socket.emit('nextSet');
    };

    const handleEndWorkout = () => {
        setIsWorkoutActive(false);
        setIsPaused(false);
        socket.emit('endWorkout');
    };

    const chartData = {
        labels: muscleActivation.map((_, index) => index.toString()),
        datasets: [
            {
                label: 'Muscle Activation',
                data: muscleActivation,
                fill: false,
                borderColor: 'hsl(var(--primary))',
                backgroundColor: 'hsla(var(--primary), 0.1)',
                tension: 0.1,
            },
        ],
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Muscle Activation Graph' },
        },
        scales: {
            x: { type: 'category', title: { display: true, text: 'Time' } },
            y: {
                title: { display: true, text: 'Activation' },
                suggestedMin: 0,
                suggestedMax: 100,
            },
        },
    };

    useEffect(() => {
        let lastRepCount = 0; // Keep track of the last rep count

        // Connect to the Express server via Socket.IO
        socket = io('http://localhost:8080'); // Replace with your server address if deployed

        // Listen for real-time data from the Arduino via Socket.IO
        socket.on('arduino-data', (data) => {
            // Calculate the difference between the new rep count and the last rep count
            const newReps = data.repCount - lastRepCount;

            // Only add positive differences to total reps
            if (newReps > 0) {
                setTotalReps((prev) => prev + newReps);
            }

            // Update the rep count and sensor value in the state
            setRepCount(data.repCount);
            setSensorValue(data.sensorValue);
            setMuscleActivation((prev) => [...prev, data.sensorValue]);

            // Update lastRepCount to the current rep count
            lastRepCount = data.repCount;
        });

        return () => {
            socket.disconnect();
        };
    }, []);


    return (
        <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold mb-6 text-center text-primary">Workout Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Dumbbell className="mr-2" /> Workout Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Current Set</p>
                                    <p className="text-3xl font-bold text-primary">{setCount + 1}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Reps</p>
                                    <p className="text-3xl font-bold text-primary">{totalReps}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Current Set Reps</p>
                                <p className="text-5xl font-bold text-center my-4 text-primary">{repCount}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Muscle Activation</p>
                                <Progress value={sensorValue} className="w-full h-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Muscle Activation Graph</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Line data={chartData} options={chartOptions} />
                    </CardContent>
                </Card>
            </div>
            <Card className="mt-6 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex flex-wrap justify-center gap-4">
                        {!isWorkoutActive ? (
                            <Button onClick={handleStartWorkout} className="w-full sm:w-auto" size="lg">
                                <Play className="mr-2 h-4 w-4" /> Start Workout
                            </Button>
                        ) : (
                            <>
                                <Button onClick={handlePauseResume} className="w-full sm:w-auto" size="lg">
                                    {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                                    {isPaused ? 'Resume' : 'Pause'}
                                </Button>
                                <Button onClick={handleNextSet} className="w-full sm:w-auto" size="lg">
                                    <SkipForward className="mr-2 h-4 w-4" /> Next Set
                                </Button>
                                <Button onClick={handleEndWorkout} variant="destructive" className="w-full sm:w-auto" size="lg">
                                    <StopCircle className="mr-2 h-4 w-4" /> End Workout
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
