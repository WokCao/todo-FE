import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import type { Task, User } from "@/interfaces/types"
import { AddTaskFab } from "@/components/AddTaskFab"
import { AiChat } from "@/components/AIChat"
import { useNavigate } from "react-router-dom"
import { getTasks } from "@/APIs/Task"
import { fetchUserProfile } from "@/APIs/Auth"
import { useAuth } from "@/store/AuthContext"

const priorityColors = {
    LOW: "bg-green-100 text-green-800 border-green-200",
    MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
    HIGH: "bg-red-100 text-red-800 border-red-200",
}

const statusColors = {
    TODO: "bg-gray-100 text-gray-800 border-gray-200",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    OVERDUE: "bg-red-100 text-red-800 border-red-200",
}

export default function CalendarPage() {
    const navigate = useNavigate()
    const [tasks, setTasks] = useState<Task[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split("T")[0]) // Default to today
    const { dispatch } = useAuth();

    const checkAuth = async () => {
            const token = localStorage.getItem("token")
            if (token) {
                await fetchUserProfile().then((user: User) => {
                    if (user) {
                        dispatch({ type: "SET_USER", payload: user });
                    } else {
                        navigate("/auth/login")
                    }
                })
            } else {
                navigate("/auth/login")
            }
        }

    const loadTasks = async () => {
        const loadedTasks = await getTasks()
        console.log("Loaded tasks:", loadedTasks)
        setTasks(loadedTasks.content)
    }

    useEffect(() => {
        // Check authentication
        checkAuth()

        // Load tasks
        loadTasks()
    }, [])

    const handleTaskAdded = async () => {
        const loadedTasks = await getTasks()
        setTasks(loadedTasks.content)
    }

    // Get tasks for a specific date
    const getTasksForDate = (date: string): Task[] => {
        return tasks.filter((task) => task.dueDate.split("T")[0] === date)
    }

    // Format local datetime
    const formatLocalDateTime = (date: Date): string => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        const firstDay = new Date(year, month, 1)
        const startDate = new Date(firstDay)
        startDate.setDate(startDate.getDate() - firstDay.getDay())

        const days = []
        const currentDateObj = new Date(startDate)

        for (let i = 0; i < 42; i++) {
            // Use local datetime
            const dateString = formatLocalDateTime(currentDateObj).split("T")[0]
            const dayTasks = getTasksForDate(dateString)
            const isCurrentMonth = currentDateObj.getMonth() === month
            const isToday = dateString === new Date().toISOString().split("T")[0]

            days.push({
                date: new Date(currentDateObj),
                dateString,
                dayTasks,
                isCurrentMonth,
                isToday,
            })

            currentDateObj.setDate(currentDateObj.getDate() + 1)
        }

        return days
    }

    const navigateMonth = (direction: "prev" | "next") => {
        const newDate = new Date(currentDate)
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
        setCurrentDate(newDate)
    }

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const calendarDays = generateCalendarDays()
    const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : []

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Calendar */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl">
                                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Week headers */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {weekDays.map((day) => (
                                        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map((day, index) => (
                                        <div
                                            key={index}
                                            className={`
                                                        min-h-[80px] p-1 border border-border rounded-md cursor-pointer transition-colors
                                                        ${day.isCurrentMonth ? "bg-card hover:bg-muted/50" : "bg-muted/20 text-muted-foreground"}
                                                        ${day.isToday ? "ring-2 ring-primary" : ""}
                                                        ${selectedDate === day.dateString ? "bg-primary/10 border-primary" : ""}
                                                    `}
                                            onClick={() => setSelectedDate(day.dateString)}
                                        >
                                            <div className="text-sm font-medium mb-1">{day.date.getDate()}</div>
                                            <div className="space-y-1">
                                                {day.dayTasks.slice(0, 2).map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className={`
                                                                    text-xs px-1 py-0.5 rounded truncate cursor-pointer
                                                                    ${statusColors[task.status]}
                                                                    `}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            navigate(`/tasks/${task.id}`)
                                                        }}
                                                    >
                                                        {task.title}
                                                    </div>
                                                ))}
                                                {day.dayTasks.length > 2 && (
                                                    <div className="text-xs text-muted-foreground px-1">+{day.dayTasks.length - 2} more</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Selected date tasks */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5" />
                                    {selectedDate
                                        ? new Date(selectedDate).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                        })
                                        : "Select a date"}
                                </CardTitle>
                                <CardDescription>
                                    {selectedDate
                                        ? selectedTasks.length > 0
                                            ? `${selectedTasks.length} task${selectedTasks.length === 1 ? "" : "s"} due`
                                            : "No tasks due on this date"
                                        : "Click on a date to view tasks"}
                                </CardDescription>
                            </CardHeader>
                            {selectedTasks.length > 0 && (
                                <CardContent className="space-y-3">
                                    {selectedTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => navigate(`/tasks/${task.id}`)}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                                                <Badge className={priorityColors[task.priority]}>
                                                    {task.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description || "No description available"}</p>
                                            <Badge className={statusColors[task.status]}>
                                                {task.status.replace("-", " ")}
                                            </Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            )}
                        </Card>

                        {/* Calendar legend */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg">Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2 items-start flex-wrap">
                                    <p className="text-sm font-medium">Task Status:</p>
                                    <div className="flex space-x-2 space-y-2 flex-wrap items-start">
                                        <div className="flex items-center gap-2">
                                            <Badge className={statusColors.TODO}>
                                                To Do
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={statusColors.IN_PROGRESS}>
                                                In Progress
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={statusColors.COMPLETED}>
                                                Completed
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={statusColors.OVERDUE}>
                                                Overdue
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <AddTaskFab onTaskAdded={handleTaskAdded} />
            <AiChat />
        </div>
    )
}
