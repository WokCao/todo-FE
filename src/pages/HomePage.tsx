import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AddTaskFab } from "@/components/AddTaskFab"
import { AiChat } from "@/components/AIChat"
import { useNavigate } from "react-router-dom"
import { fetchUserProfile } from "@/APIs/Auth"
import { useAuth } from "@/store/AuthContext"
import type { User } from "@/interfaces/types"
import { getTasks } from "@/APIs/Task"


export default function HomePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [activeTasks, setActiveTasks] = useState(0)
    const [tasksDueToday, setTasksDueToday] = useState(0)
    const [tasksCompletedThisWeek, setTasksCompletedThisWeek] = useState(0)
    const navigate = useNavigate()
    const { dispatch } = useAuth();

    const checkAuth = async () => {
        const token = localStorage.getItem("token")
        if (token) {
            await fetchUserProfile().then((user: User) => {
                if (user) {
                    setIsAuthenticated(true)
                    dispatch({ type: "SET_USER", payload: user });
                } else {
                    navigate("/auth/login")
                }
            })
        } else {
            navigate("/auth/login")
        }
    }

    // Fetch active tasks from the API
    const fetchActiveTasks = async () => {
        const tasks = await getTasks()
        const active = tasks.content.filter(task => task.status === "TODO").length
        setActiveTasks(active)
    }

    // Fetch number of tasks due today from the API
    const fetchTasksDueToday = async () => {
        // Format to 'yyyy-MM-ddTHH:mm:ss' (local time, no timezone)
        const pad = (n: number) => n.toString().padStart(2, '0');
        const now = new Date();
        const fromDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T00:00:00`;
        const toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const toDateTime = `${toDate.getFullYear()}-${pad(toDate.getMonth() + 1)}-${pad(toDate.getDate())}T23:59:59`;
        const tasks = await getTasks({ fromDateTime, toDateTime });

        setTasksDueToday(tasks.totalElements)
    }

    // Fetch number of tasks completed this week from the API
    const fetchTasksCompletedThisWeek = async () => {
        // Format to 'yyyy-MM-ddTHH:mm:ss' (local time, no timezone)
        const pad = (n: number) => n.toString().padStart(2, '0');
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);
        const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59, 999);
        const fromDateTime = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}T00:00:00`;
        const toDateTime = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}T23:59:59`;

        const tasks = await getTasks({ fromDateTime, toDateTime, status: "COMPLETED" });
        setTasksCompletedThisWeek(tasks.totalElements)
    }

    useEffect(() => {
        checkAuth()
        fetchActiveTasks()
        fetchTasksDueToday()
        fetchTasksCompletedThisWeek()
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
                            <p className="text-2xl font-bold text-foreground">{activeTasks}</p>
                            <p className="text-sm text-muted-foreground">Active tasks</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/calendar")}>
                        <CardHeader>
                            <CardTitle className="text-primary">Calendar</CardTitle>
                            <CardDescription>View tasks in calendar format</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-foreground">{tasksDueToday}</p>
                            <p className="text-sm text-muted-foreground">Due today</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-primary">Completed</CardTitle>
                            <CardDescription>Recently completed tasks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-foreground">{tasksCompletedThisWeek}</p>
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
