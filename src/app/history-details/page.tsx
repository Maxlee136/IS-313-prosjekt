'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Definer en type for historikk-nøklene
type HistoryItemKey = "Workout: 01/10/2024 - Bicep day" | "Workout: 02/10/2024 - Full body"

// Eksempeldata for spesifikke stats
const stats: Record<HistoryItemKey, { 
    duration: string; 
    exercises: string[]; 
    calories: number;
    details: Array<{
        date: string;
        sets: number;
        reps: number;
        muscleActivation: number; // Prosentvis muskelaktivering
    }>;
}> = {
    "Workout: 01/10/2024 - Bicep day": {
        duration: '45 minutes',
        exercises: ['Bicep curls', 'Hammer curls', 'Concentration curls'],
        calories: 300,
        details: [
            { date: '01/10/2024', sets: 3, reps: 12, muscleActivation: 75 },
            { date: '01/10/2024', sets: 3, reps: 10, muscleActivation: 80 },
            { date: '01/10/2024', sets: 3, reps: 8, muscleActivation: 85 },
        ]
    },
    "Workout: 02/10/2024 - Full body": {
        duration: '60 minutes',
        exercises: ['Squats', 'Bench press', 'Deadlifts', 'Pull-ups'],
        calories: 500,
        details: [
            { date: '02/10/2024', sets: 4, reps: 10, muscleActivation: 70 },
            { date: '02/10/2024', sets: 3, reps: 8, muscleActivation: 75 },
            { date: '02/10/2024', sets: 3, reps: 6, muscleActivation: 85 },
        ]
    }
}

export default function HistoryDetailsPage() {
    const router = useRouter()
    const [historyItem, setHistoryItem] = useState<string | null>(null)

    // Hent parameteren fra URL-en
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const item = params.get('item')
        if (item) {
            setHistoryItem(decodeURIComponent(item))
        }
    }, [])

    if (!historyItem) {
        return <p>Loading...</p>
    }

    // Bruker typecasting for å forsikre om at historyItem er en gyldig nøkkel
    const itemStats = stats[historyItem as HistoryItemKey] || {}

    return (
        <div className="flex h-screen bg-background justify-center items-center">
            <Card className="max-w-md">
                <CardContent className="p-4">
                    <h1 className="text-2xl font-bold mb-4">{historyItem}</h1>
                    <p><strong>Duration:</strong> {itemStats.duration || 'N/A'}</p>
                    <p><strong>Calories burned:</strong> {itemStats.calories || 'N/A'}</p>
                    <p><strong>Exercises:</strong> {itemStats.exercises ? itemStats.exercises.join(', ') : 'N/A'}</p>

                    {/* Tabell for sett, repetisjoner, muskelaktivering */}
                    <h2 className="text-xl font-bold mt-4">Details</h2>
                    <table className="table-auto w-full text-left mt-2">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Sets</th>
                                <th>Reps</th>
                                <th>Muscle Activation (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemStats.details && itemStats.details.length > 0 ? (
                                itemStats.details.map((detail, index) => (
                                    <tr key={index}>
                                        <td>{detail.date}</td>
                                        <td>{detail.sets}</td>
                                        <td>{detail.reps}</td>
                                        <td>{detail.muscleActivation}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4}>No details available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <Button className="mt-4" onClick={() => router.back()}>Back to History</Button>
                </CardContent>
            </Card>
        </div>
    )
}
