"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X, Bot, User } from "lucide-react"
import { getTasks } from "../interfaces/MockData"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm your AI task assistant. I can help you organize and prioritize your tasks. Try asking me something like 'How should I arrange my tasks?' or 'What should I focus on today?'",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const generateAIResponse = (userMessage: string): string => {
    const tasks = getTasks()
    const lowercaseMessage = userMessage.toLowerCase()

    // Analyze tasks for contextual responses
    const highPriorityTasks = tasks.filter((t) => t.priority === "high" && t.status !== "completed")
    const overdueTasks = tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "completed")
    const todayTasks = tasks.filter((t) => t.dueDate === new Date().toISOString().split("T")[0])
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress")

    // Response patterns based on user input
    if (
      lowercaseMessage.includes("arrange") ||
      lowercaseMessage.includes("organize") ||
      lowercaseMessage.includes("prioritize")
    ) {
      if (highPriorityTasks.length > 0) {
        return `I recommend focusing on your ${highPriorityTasks.length} high-priority tasks first: ${highPriorityTasks
          .slice(0, 2)
          .map((t) => `"${t.title}"`)
          .join(
            ", ",
          )}${highPriorityTasks.length > 2 ? ` and ${highPriorityTasks.length - 2} more` : ""}. These should take precedence over lower-priority items.`
      }
      return "I suggest organizing your tasks by priority and due date. Start with high-priority items, then tackle tasks due soon. Consider grouping similar tasks together for better efficiency."
    }

    if (lowercaseMessage.includes("today") || lowercaseMessage.includes("focus")) {
      if (overdueTasks.length > 0) {
        return `You have ${overdueTasks.length} overdue task${overdueTasks.length === 1 ? "" : "s"} that need immediate attention: ${overdueTasks
          .slice(0, 2)
          .map((t) => `"${t.title}"`)
          .join(", ")}. I recommend addressing these first.`
      }
      if (todayTasks.length > 0) {
        return `For today, focus on these ${todayTasks.length} task${todayTasks.length === 1 ? "" : "s"} due: ${todayTasks.map((t) => `"${t.title}"`).join(", ")}. Break them into smaller steps if they seem overwhelming.`
      }
      if (highPriorityTasks.length > 0) {
        return `Today, I suggest focusing on your high-priority tasks: ${highPriorityTasks
          .slice(0, 2)
          .map((t) => `"${t.title}"`)
          .join(", ")}. These will have the biggest impact on your goals.`
      }
      return "Start your day by reviewing your task list and identifying the 2-3 most important items. Focus on completing these before moving to less critical tasks."
    }

    if (lowercaseMessage.includes("overdue") || lowercaseMessage.includes("late")) {
      if (overdueTasks.length > 0) {
        return `You have ${overdueTasks.length} overdue task${overdueTasks.length === 1 ? "" : "s"}. I recommend addressing "${overdueTasks[0].title}" first as it's been overdue the longest. Consider breaking large tasks into smaller, manageable pieces.`
      }
      return "Great news! You don't have any overdue tasks. Keep up the good work with staying on schedule!"
    }

    if (lowercaseMessage.includes("progress") || lowercaseMessage.includes("status")) {
      const completedTasks = tasks.filter((t) => t.status === "completed")
      const todoTasks = tasks.filter((t) => t.status === "todo")

      return `Here's your progress: ${completedTasks.length} completed, ${inProgressTasks.length} in progress, and ${todoTasks.length} to-do tasks. ${inProgressTasks.length > 0 ? `Consider finishing "${inProgressTasks[0].title}" before starting new tasks.` : "Great job staying organized!"}`
    }

    if (lowercaseMessage.includes("deadline") || lowercaseMessage.includes("due")) {
      const upcomingTasks = tasks
        .filter((t) => t.status !== "completed" && new Date(t.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3)

      if (upcomingTasks.length > 0) {
        return `Your upcoming deadlines: ${upcomingTasks.map((t) => `"${t.title}" (${new Date(t.dueDate).toLocaleDateString()})`).join(", ")}. I suggest working on these in chronological order.`
      }
      return "You don't have any upcoming deadlines. This is a great time to work on long-term projects or get ahead on future tasks!"
    }

    if (lowercaseMessage.includes("help") || lowercaseMessage.includes("what can you do")) {
      return "I can help you with task management! Ask me about:\n• Prioritizing and organizing tasks\n• What to focus on today\n• Managing overdue items\n• Checking your progress\n• Planning around deadlines\n• General productivity tips"
    }

    // Default responses for general queries
    const defaultResponses = [
      "Based on your current tasks, I recommend focusing on high-priority items first. Would you like me to suggest a specific order?",
      "Consider using the Pomodoro technique: work for 25 minutes, then take a 5-minute break. This can help with focus and productivity.",
      "Try grouping similar tasks together. For example, batch all your communication tasks or all your creative work for better efficiency.",
      "Don't forget to celebrate small wins! Completing tasks, even small ones, builds momentum for bigger achievements.",
      "If a task seems overwhelming, try breaking it down into smaller, actionable steps. This makes it easier to get started.",
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(
      () => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateAIResponse(userMessage.content),
          sender: "ai",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiResponse])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    ) // 1-2 second delay
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        size="lg"
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 left-6 w-80 h-96 shadow-xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Assistant
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your tasks..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
            />
            <Button size="sm" onClick={handleSendMessage} disabled={isTyping || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
