'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dumbbell, BarChart2, LogOut } from 'lucide-react'
import { UserButton, useUser } from "@clerk/nextjs";

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useUser(); // Fetch user information

    const navItems = [
        { href: "/dashboard", icon: BarChart2, label: "Dashboard" },
        { href: "/exercise-selection", icon: Dumbbell, label: "Exercises" },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-col md:h-screen md:border-r md:bg-muted/40 md:w-64">
                <div className="p-6">
                    <h2 className="text-2xl font-semibold tracking-tight">Gamer Gunz</h2>
                </div>
                <ScrollArea className="flex-1">
                    <nav className="grid items-start px-4 text-sm font-medium">
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href} passHref>
                                <Button variant="ghost" className={cn(
                                    "w-full justify-start",
                                    pathname === item.href && "bg-muted"
                                )}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                    </nav>
                </ScrollArea>
                <div className="p-4 flex items-center justify-between">
                    {/* User information section */}
                    <div className="flex items-center space-x-4">
                        <UserButton appearance={{
                            elements: {
                                userButtonAvatarBox: 'w-10 h-10',
                            },
                        }} />
                        {/* Check if the user is defined and display username or fallback */}
                        <span className="text-sm font-medium">
                            {user?.username || user?.firstName || 'User'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Mobile Tabbar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t">
                <nav className="flex justify-around items-center h-16">
                    <UserButton appearance={{
                        elements: {
                            userButtonAvatarBox: 'w-10 h-10',
                        },
                    }} />
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} passHref>
                            <Button variant="ghost" className={cn(
                                "flex flex-col items-center justify-center h-full",
                                pathname === item.href && "text-primary"
                            )}>
                                <item.icon className="h-5 w-5" />
                                <span className="text-xs mt-1">{item.label}</span>
                            </Button>
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
}
