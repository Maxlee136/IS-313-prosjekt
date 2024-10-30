'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Eye } from 'lucide-react'  // Bytt Plus til Eye for historikkvisning
import { Sidebar } from '@/components/sidebar'

// Dette kan være en liste over tidligere aktiviteter eller historikkdata
const historyItems = [
    "Workout: 01/10/2024 - Bicep day",
    "Workout: 02/10/2024 - Full body",
    "Workout: 03/10/2024 - Leg day",
    "Workout: 04/10/2024 - Chest and Back",
    "Workout: 05/10/2024 - Rest day",
    "Workout: 06/10/2024 - Cardio session"
]

export default function HistoryPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    // Filterer historikk basert på søketerm
    const filteredHistory = historyItems.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Håndterer valg av historikk og sender bruker til en detaljer-side
    const handleHistorySelect = (item: string) => {
        router.push(`/history-details?item=${encodeURIComponent(item)}`)
    }

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4">
                    <Card className="mx-auto max-w-md">
                        <CardContent className="p-4 flex flex-col h-full">
                            <h1 className="text-2xl font-bold mb-4">History</h1>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search history"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full"
                                />
                            </div>
                            <div className="flex-1 overflow-auto">
                                {filteredHistory.map((item, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="w-full mb-2 justify-between text-left"
                                        onClick={() => handleHistorySelect(item)}
                                    >
                                        {item}
                                        <Eye size={20} />  {/* Ikon for å vise detaljer */}
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
