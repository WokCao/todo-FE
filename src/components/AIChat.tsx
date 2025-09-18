"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X, Bot, User } from "lucide-react"
import { getSuggestion } from "@/APIs/Task"

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
        "Hi! I'm your AI task assistant. I can help you organize and prioritize your tasks. Try asking me something like 'How should I arrange my tasks in September 2025?' (Note that I can only provide suggestions when your questions include month and year.)",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages])

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simple keyword check for month and year
    const monthYearPattern = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i;
    if (!monthYearPattern.test(userMessage)) {
      return "Please include a specific month and year in your question so I can provide relevant task suggestions."
    }

    // Extract month and year from user message
    const match = userMessage.match(monthYearPattern);
    if (!match) {
      return "I couldn't identify the month and year in your question. Please try again."
    }

    const [month, year] = match[0].split(" ");

    // Fetch tasks from the API
    try {
      const tasksResponse = await getSuggestion(`How should I arrange my tasks in ${month} ${year}?`);
      if (!tasksResponse || !tasksResponse.schedule || tasksResponse.schedule.length === 0) {
        return "I couldn't fetch task suggestions at the moment. Please try again later."
      }

      // Convert tasks into a readable string
      const formattedSchedule = tasksResponse.schedule
        .map(task => {
          return `• [${task.taskId}] ${task.title} — start: ${task.suggestedStart}, duration: ${task.durationMinutes} min. Summary: ${task.summary}`
        })
        .join("\n")

      return formattedSchedule
    } catch (error) {
      return "There was an error fetching task suggestions. Please try again later."
    }
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
      async () => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: await generateAIResponse(userMessage.content),
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
    <Card className="fixed bottom-6 left-6 w-1/4 h-1/2 shadow-xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Assistant
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 px-4 min-h-0">
          <div
            className="space-y-4 pb-4 flex-1 min-h-0 max-h-[100%] overflow-y-auto"
          >
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
                  className={`max-w-[70%] px-3 py-2 text-sm break-words
                    ${message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-lg"
                      : "bg-gradient-to-br from-pink-50 to-blue-50 border border-blue-200 shadow-sm rounded-2xl"}
                  `}
                  style={message.sender === "ai" ? { borderLeft: '4px solid #60a5fa', boxShadow: '0 2px 8px 0 #e0e7ef' } : {}}
                >
                  {message.sender === "ai" && message.content.includes('• [') ? (
                    <div className="space-y-2">
                      {message.content.split('\n').map((line, idx) => {
                        if (line.trim().startsWith('• [')) {
                          // Parse: • [taskId] title — start: ..., duration: ... min. Summary: ...
                          const match = line.match(/^• \[(.+?)\] (.+?) — start: (.+?), duration: (\d+) min\. Summary: (.+)$/);
                          if (match) {
                            const [, taskId, title, start, duration, summary] = match;
                            return (
                              <div key={idx} className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 flex flex-col shadow-sm">
                                <div className="font-semibold text-blue-900 mb-1">{title}</div>
                                <div className="text-xs text-blue-700 mb-1 flex flex-wrap gap-2">
                                  <span className="bg-blue-200/60 rounded px-1">ID: {taskId}</span>
                                  <span className="bg-green-100 rounded px-1">Start: {start}</span>
                                  <span className="bg-yellow-100 rounded px-1">⏱ {duration} min</span>
                                </div>
                                <div className="text-xs text-gray-700 mt-1"><span className="font-medium">Summary:</span> {summary}</div>
                              </div>
                            );
                          }
                        }
                        // fallback for other lines
                        return line.trim() !== '' ? (
                          <div key={idx} className="text-blue-700 font-medium mb-1">{line}</div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                  <div className="text-xs opacity-70 mt-1 text-right">
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
            <div ref={bottomRef} />

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
              onKeyDown={handleKeyPress}
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
