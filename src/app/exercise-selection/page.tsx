'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'

const exercises = [
    "Bicep curl",
    "Hammer curl",
    "Bench press",
    "Pull up",
    "Leg extension",
    "Squat",
    "Deadlift",
    "Shoulder press"
]

export default function ExerciseSelectionPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    const filteredExercises = exercises.filter(exercise =>
        exercise.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleExerciseSelect = (exercise: string) => {
        // In a real app, you might want to store the selected exercise in state or context
        router.push(`/workout?exercise=${encodeURIComponent(exercise)}`)
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4">
                    <Card className="mx-auto max-w-md">
                        <CardContent className="p-4 flex flex-col h-full">
                            <h1 className="text-2xl font-bold mb-4">What exercise?</h1>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search for exercises"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full"
                                />
                            </div>
                            <div className="flex-1 overflow-auto">
                                {filteredExercises.map((exercise, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="w-full mb-2 justify-between text-left"
                                        onClick={() => handleExerciseSelect(exercise)}
                                    >
                                        {exercise}
                                        <Plus size={20} />
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    )
}