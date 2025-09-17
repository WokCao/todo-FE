import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Clock, Flag, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import type { Task, User } from "@/interfaces/types"
import { AddTaskFab } from "@/components/AddTaskFab"
import { AiChat } from "@/components/AIChat"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/store/AuthContext"
import { fetchUserProfile } from "@/APIs/Auth"
import { getTasks } from "@/APIs/Task"

type SortField = "name" | "date" | "priority"
type SortDirection = "ASC" | "DESC"

const TASKS_PER_PAGE = 6

const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3 }

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

export default function TasksPage() {
    const navigate = useNavigate()
    const [tasks, setTasks] = useState<Task[]>([])
    const [filter, setFilter] = useState<"ALL" | "TODO" | "IN_PROGRESS" | "COMPLETED">("ALL")
    const [sortField, setSortField] = useState<SortField>("date")
    const [sortDirection, setSortDirection] = useState<SortDirection>("ASC")
    const [currentPage, setCurrentPage] = useState(1)
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
        setTasks(loadedTasks.content)
    }

    useEffect(() => {
        checkAuth();
        loadTasks();
    }, [])

    const handleTaskAdded = () => {
        loadTasks()
        setCurrentPage(1)
    }

    const filteredTasks = tasks.filter((task) => (filter === "ALL" ? true : task.status === filter))

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        let comparison = 0

        switch (sortField) {
            case "name":
                comparison = a.title.localeCompare(b.title)
                break
            case "date":
                comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                break
            case "priority":
                comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
                break
        }

        return sortDirection === "ASC" ? comparison : -comparison
    })

    const totalPages = Math.ceil(sortedTasks.length / TASKS_PER_PAGE)
    const startIndex = (currentPage - 1) * TASKS_PER_PAGE
    const paginatedTasks = sortedTasks.slice(startIndex, startIndex + TASKS_PER_PAGE)

    const handleFilterChange = (newFilter: typeof filter) => {
        setFilter(newFilter)
        setCurrentPage(1)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Filter buttons */}
                <div className="flex gap-2 mb-6">
                    <Button variant={filter === "ALL" ? "default" : "outline"} onClick={() => handleFilterChange("ALL")}>
                        All Tasks ({tasks.length})
                    </Button>
                    <Button variant={filter === "TODO" ? "default" : "outline"} onClick={() => handleFilterChange("TODO")}>
                        To Do ({tasks.filter((t) => t.status === "TODO").length})
                    </Button>
                    <Button
                        variant={filter === "IN_PROGRESS" ? "default" : "outline"}
                        onClick={() => handleFilterChange("IN_PROGRESS")}
                    >
                        In Progress ({tasks.filter((t) => t.status === "IN_PROGRESS").length})
                    </Button>
                    <Button
                        variant={filter === "COMPLETED" ? "default" : "outline"}
                        onClick={() => handleFilterChange("COMPLETED")}
                    >
                        Completed ({tasks.filter((t) => t.status === "COMPLETED").length})
                    </Button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Sort by:</span>
                    </div>
                    <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC")}
                    >
                        {sortDirection === "ASC" ? "↑" : "↓"}
                    </Button>
                </div>

                {/* Tasks grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedTasks.map((task) => (
                        <Card
                            key={task.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(`/tasks/${task.id}`)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg line-clamp-2">{task.title}</CardTitle>
                                    <Badge className={priorityColors[task.priority]}>
                                        <Flag className="h-3 w-3 mr-1" />
                                        {task.priority}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                    <Badge className={statusColors[task.status]}>{task.status.replace("-", " ")}</Badge>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {formatDate(task.dueDate)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className="w-10"
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {filteredTasks.length === 0 && (
                    <div className="text-center py-12">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
                        <p className="text-muted-foreground">
                            {filter === "ALL"
                                ? "You don't have any tasks yet. Create your first task to get started!"
                                : `No tasks with status "${filter.replace("-", " ")}" found.`}
                        </p>
                    </div>
                )}

                {filteredTasks.length > 0 && (
                    <div className="text-center text-sm text-muted-foreground mt-4">
                        Showing {startIndex + 1}-{Math.min(startIndex + TASKS_PER_PAGE, filteredTasks.length)} of{" "}
                        {filteredTasks.length} tasks
                    </div>
                )}
            </main>

            <AddTaskFab onTaskAdded={handleTaskAdded} />
            <AiChat />
        </div>
    )
}
