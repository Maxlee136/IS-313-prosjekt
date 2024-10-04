'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { Line } from 'react-chartjs-2'
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
} from 'chart.js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dumbbell, Play, Pause, SkipForward, StopCircle, Flame, Trophy, Target } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

let socket: Socket

export default function Page() {
    return (
        <Suspense fallback={<div>Loading workout dashboard...</div>}>
            <WorkoutDashboard />
        </Suspense>
    )
}

function WorkoutDashboard() {
    const searchParams = useSearchParams()
    const exercise = searchParams.get('exercise') || 'Unknown Exercise'

    const [repCount, setRepCount] = useState<number>(0)
    const [sensorValue, setSensorValue] = useState<number>(0)
    const [setCount, setSetCount] = useState<number>(0)
    const [muscleActivation, setMuscleActivation] = useState<number[]>([])
    const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false)
    const [isPaused, setIsPaused] = useState<boolean>(false)
    const [totalReps, setTotalReps] = useState<number>(0)
    const [caloriesBurned, setCaloriesBurned] = useState<number>(0)
    const [workoutDuration, setWorkoutDuration] = useState<number>(0)
    const [personalBest, setPersonalBest] = useState<number>(0)

    useEffect(() => {
        socket = io({
            path: '/api/socketio',
        })

        socket.on('repCount', (count: number) => {
            setRepCount(count)
            setTotalReps(prev => prev + 1)
        })

        socket.on('sensorValue', (value: number) => {
            setSensorValue(value)
            setMuscleActivation(prev => [...prev, value].slice(-20))
        })

        // Simulated data updates
        const interval = setInterval(() => {
            if (isWorkoutActive && !isPaused) {
                setCaloriesBurned(prev => prev + 1)
                setWorkoutDuration(prev => prev + 1)
            }
        }, 1000)

        return () => {
            if (socket) {
                socket.disconnect()
            }
            clearInterval(interval)
        }
    }, [isWorkoutActive, isPaused])

    useEffect(() => {
        if (totalReps > personalBest) {
            setPersonalBest(totalReps)
        }
    }, [totalReps, personalBest])

    const handleStartWorkout = () => {
        setIsWorkoutActive(true)
        setIsPaused(false)
        setRepCount(0)
        setSetCount(0)
        setTotalReps(0)
        setMuscleActivation([])
        setCaloriesBurned(0)
        setWorkoutDuration(0)
        socket.emit('startWorkout')
    }

    const handlePauseResume = () => {
        setIsPaused(!isPaused)
        socket.emit(isPaused ? 'resumeWorkout' : 'pauseWorkout')
    }

    const handleNextSet = () => {
        setSetCount(prev => prev + 1)
        setRepCount(0)
        socket.emit('nextSet')
    }

    const handleEndWorkout = () => {
        setIsWorkoutActive(false)
        setIsPaused(false)
        socket.emit('endWorkout')
    }

    const chartData: {
        datasets: {
            borderColor: string;
            backgroundColor: string;
            tension: number;
            data: number[];
            label: string;
            fill: boolean
        }[];
        labels: string[]
    } = {
        labels: muscleActivation.map((_, index) => index.toString()),
        datasets: [
            {
                label: 'Muscle Activation',
                data: muscleActivation,
                fill: false,
                borderColor: 'hsl(var(--primary))',
                backgroundColor: 'hsla(var(--primary), 0.1)',
                tension: 0.1
            }
        ]
    }

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Muscle Activation Graph'
            }
        },
        scales: {
            x: {
                type: 'category',
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Activation'
                },
                suggestedMin: 0,
                suggestedMax: 100
            }
        }
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <main className="p-6">
                    <h1 className="text-3xl font-bold mb-6">Workout Dashboard: {exercise}</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Dumbbell className="mr-2" /> Workout Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <StatItem icon={<Target />} label="Current Set" value={setCount + 1} />
                                        <StatItem icon={<Trophy />} label="Total Reps" value={totalReps} />
                                        <StatItem icon={<Flame />} label="Calories Burned" value={caloriesBurned} />
                                        <StatItem icon={<Dumbbell />} label="Personal Best" value={personalBest} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Current Set Reps</p>
                                        <p className="text-5xl font-bold text-center my-4 text-primary">{repCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Muscle Activation</p>
                                        <Progress value={sensorValue} className="w-full h-4" />
                                    </div>
                                    <p className="text-center text-sm text-muted-foreground">
                                        Workout Duration: {Math.floor(workoutDuration / 60)}m {workoutDuration % 60}s
                                    </p>
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
                </main>
            </div>
        </div>
    )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-primary mb-1">{icon}</div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-lg font-bold text-primary">{value}</p>
        </div>
    )
}
