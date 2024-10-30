'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dumbbell, Flame, Trophy, Target, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
    const [totalWorkouts, setTotalWorkouts] = useState(0)
    const [caloriesBurned, setCaloriesBurned] = useState(0)
    const [streak, setStreak] = useState(0)
    const [weeklyGoal, setWeeklyGoal] = useState(0)
    const [level, setLevel] = useState(1)
    const [xp, setXp] = useState(0)

    useEffect(() => {
        // Simulated data - in a real app, these would come from a backend
        setTotalWorkouts(23)
        setCaloriesBurned(4500)
        setStreak(7)
        setWeeklyGoal(3)
        setLevel(5)
        setXp(75)
    }, [])

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <main className="p-6">
                    <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard icon={<Dumbbell className="h-6 w-6" />} title="Total Workouts" value={totalWorkouts} />
                        <StatCard icon={<Flame className="h-6 w-6" />} title="Current Streak" value={`${streak} days`} />
                        <StatCard icon={<Target className="h-6 w-6" />} title="Weekly Goal" value={`${weeklyGoal}/5 workouts`} />
                    </div>
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Level Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4">
                                <TrendingUp className="h-6 w-6 text-primary" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Level {level}</p>
                                    <Progress value={xp} className="h-2" />
                                </div>
                                <p className="text-sm font-medium">{xp}%</p>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Add more dashboard content here */}
                </main>
            </div>
        </div>
    )
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) {
    return (
        <Card>
            <CardContent className="flex flex-col items-center p-6">
                <div className="text-primary mb-2">{icon}</div>
                <h3 className="font-semibold text-center">{title}</h3>
                <p className="text-2xl font-bold text-center">{value}</p>
            </CardContent>
        </Card>
    )
}