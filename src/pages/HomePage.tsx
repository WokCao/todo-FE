import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddTaskFab } from "@/components/AddTaskFab"
import { AiChat } from "@/components/AIChat"
import { useNavigate } from "react-router-dom"

export default function HomePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        // Check if user is authenticated (simple localStorage check for now)
        const user = localStorage.getItem("user")
        if (!user) {
            navigate("/auth/login")
        } else {
            setIsAuthenticated(true)
        }
    }, [])

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-foreground">TaskFlow</h1>
                    <Button
                        variant="outline"
                        onClick={() => {
                            localStorage.removeItem("user")
                            navigate("/auth/login")
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/tasks")}>
                        <CardHeader>
                            <CardTitle className="text-primary">My Tasks</CardTitle>
                            <CardDescription>View and manage your tasks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-foreground">12</p>
                            <p className="text-sm text-muted-foreground">Active tasks</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/calendar")}>
                        <CardHeader>
                            <CardTitle className="text-primary">Calendar</CardTitle>
                            <CardDescription>View tasks in calendar format</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-foreground">3</p>
                            <p className="text-sm text-muted-foreground">Due today</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-primary">Completed</CardTitle>
                            <CardDescription>Recently completed tasks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-foreground">8</p>
                            <p className="text-sm text-muted-foreground">This week</p>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <AddTaskFab />
            <AiChat />
        </div>
    )
}
