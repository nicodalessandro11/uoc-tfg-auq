"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User } from "lucide-react"
import { useMapContext } from "@/contexts/map-context"

type Message = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatSidebar() {
  const { selectedCity, selectedArea } = useMapContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialMessageSent = useRef(false)

  // Send initial welcome message
  useEffect(() => {
    if (!initialMessageSent.current) {
      setMessages([
        {
          id: "1",
          content: "Hello! I'm your geospatial assistant. Ask me anything about the map data.",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
      initialMessageSent.current = true
    }
  }, [])

  // Send context message when city or area changes
  useEffect(() => {
    if (initialMessageSent.current) {
      if (selectedCity && !selectedArea) {
        const cityMessage: Message = {
          id: Date.now().toString(),
          content: `You're now viewing ${selectedCity.name}. Select a district or neighborhood to see more details.`,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, cityMessage])
      } else if (selectedArea) {
        const areaMessage: Message = {
          id: Date.now().toString(),
          content: `You've selected ${selectedArea.name}. Population: ${selectedArea.population.toLocaleString()}, Average Income: €${selectedArea.avgIncome.toLocaleString()}. What would you like to know about this area?`,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, areaMessage])
      }
    }
  }, [selectedCity, selectedArea])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateBotResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  const generateBotResponse = (query: string): string => {
    // Simple mock responses based on keywords
    const lowerQuery = query.toLowerCase()

    if (!selectedCity) {
      return "Please select a city first to explore the data."
    }

    if (!selectedArea && !lowerQuery.includes("city") && !lowerQuery.includes(selectedCity.name.toLowerCase())) {
      return `I can provide more specific information if you select an area in ${selectedCity.name}. What would you like to know about the city in general?`
    }

    if (lowerQuery.includes("population")) {
      if (selectedArea) {
        return `${selectedArea.name} has a population of ${selectedArea.population.toLocaleString()} residents. This represents about ${Math.round((selectedArea.population / 1000000) * 100)}% of the city's total population.`
      } else {
        return `${selectedCity.name} has a total population of approximately 1.6 million residents across all districts.`
      }
    } else if (lowerQuery.includes("income") || lowerQuery.includes("salary")) {
      if (selectedArea) {
        const comparison = selectedArea.avgIncome > 35000 ? "above" : "below"
        return `The average gross taxable income in ${selectedArea.name} is €${selectedArea.avgIncome.toLocaleString()} per person, which is ${comparison} the city average.`
      } else {
        return `The average gross taxable income in ${selectedCity.name} varies by district, ranging from €25,000 to €45,000 per person.`
      }
    } else if (lowerQuery.includes("surface") || lowerQuery.includes("area")) {
      if (selectedArea) {
        return `${selectedArea.name} covers approximately ${selectedArea.avgIncome > 35000 ? 5.2 : 7.5} square kilometers, making it one of the ${selectedArea.avgIncome > 35000 ? "smaller" : "medium-sized"} districts in the city.`
      } else {
        return `${selectedCity.name} covers a total area of approximately 100 square kilometers.`
      }
    } else if (lowerQuery.includes("museum") || lowerQuery.includes("cultural")) {
      if (selectedArea) {
        return `There are ${Math.floor(Math.random() * 5) + 1} museums and ${Math.floor(Math.random() * 3) + 1} cultural centers in ${selectedArea.name}. You can see them marked on the map.`
      } else {
        return `${selectedCity.name} is home to numerous cultural facilities including museums, theaters, and exhibition centers. You can see them marked on the map.`
      }
    } else if (lowerQuery.includes("compare")) {
      if (selectedArea) {
        return `Compared to other districts in ${selectedCity.name}, ${selectedArea.name} has ${selectedArea.avgIncome > 35000 ? "higher" : "lower"} income levels and ${selectedArea.population > 150000 ? "higher" : "lower"} population density. Would you like to see a detailed comparison?`
      } else {
        return `To compare areas, first select a district or neighborhood on the map.`
      }
    } else if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
      return `Hello! I'm here to help you explore ${selectedCity ? selectedCity.name : "the map"}. What would you like to know?`
    } else if (lowerQuery.includes("show") || lowerQuery.includes("display")) {
      if (lowerQuery.includes("museum")) {
        return "I've highlighted museums on the map. You can see them marked with museum icons."
      } else if (lowerQuery.includes("park")) {
        return "Parks and gardens are now highlighted on the map. You can see them marked with tree icons."
      } else if (lowerQuery.includes("school") || lowerQuery.includes("education")) {
        return "Educational centers are now highlighted on the map. You can see them marked with school icons."
      } else {
        return "Please specify what you'd like to see on the map, such as museums, parks, or schools."
      }
    } else {
      return `I don't have specific information about that query. Try asking about population, income, surface area, or cultural facilities in ${selectedArea ? selectedArea.name : selectedCity.name}.`
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background border-l">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Geospatial Assistant
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Ask questions about the map data</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.sender === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  <span className="text-xs font-medium">{message.sender === "user" ? "You" : "Assistant"}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
