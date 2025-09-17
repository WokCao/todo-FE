import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, Flag, Save } from "lucide-react"
import type { Task, User } from "@/interfaces/types"
import { useNavigate, useParams } from "react-router-dom"
import { getTask, updateTask } from "@/APIs/Task"
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
}

export default function TaskDetailPage() {
    const navigate = useNavigate()
    const { id: taskId } = useParams<{ id: string }>()

    const [task, setTask] = useState<Task | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        status: "todo" as Task["status"],
        priority: "medium" as Task["priority"],
        dueDate: "",
    })
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

    const getTaskById = async (id: string) => {
        if (!taskId) return
        const loadedTask = await getTask(id)
        if (!loadedTask) {
            navigate("/tasks")
            return
        }

        setTask(loadedTask)
        setEditForm({
            title: loadedTask.title,
            description: loadedTask.description,
            status: loadedTask.status,
            priority: loadedTask.priority,
            dueDate: loadedTask.dueDate,
        })
    }

    useEffect(() => {
        // Check authentication
        checkAuth()

        // Load task
        getTaskById(taskId!)
    }, [taskId])

    const handleSave = async () => {
        if (!task) return

        const updatedTask = await updateTask(task.id, editForm)
        if (updatedTask) {
            setTask(updatedTask)
            setIsEditing(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    if (!task) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/tasks")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground">Task Details</h1>
                    </div>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}>Edit Task</Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main content */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Title</Label>
                                            <Input
                                                id="title"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                placeholder="Task title"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                placeholder="Task description"
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <CardTitle className="text-2xl">{task.title}</CardTitle>
                                        <CardDescription className="text-base leading-relaxed">{task.description}</CardDescription>
                                    </>
                                )}
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Task Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    {isEditing ? (
                                        <Select
                                            value={editForm.status}
                                            onValueChange={(value: Task["status"]) => setEditForm({ ...editForm, status: value })}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todo">To Do</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="mt-1">
                                            <Badge className={statusColors[task.status]}>{task.status.replace("-", " ")}</Badge>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                                    {isEditing ? (
                                        <Select
                                            value={editForm.priority}
                                            onValueChange={(value: Task["priority"]) => setEditForm({ ...editForm, priority: value })}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="mt-1">
                                            <Badge className={priorityColors[task.priority]}>
                                                <Flag className="h-3 w-3 mr-1" />
                                                {task.priority}
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Due Date</Label>
                                    {isEditing ? (
                                        <Input
                                            type="date"
                                            value={editForm.dueDate}
                                            onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <div className="mt-1 flex items-center text-sm">
                                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                            {formatDate(task.dueDate)}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                                    <div className="mt-1 flex items-center text-sm">
                                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                        {formatDate(task.createdAt)}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                                    <div className="mt-1 flex items-center text-sm">
                                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                        {formatDate(task.updatedAt)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
