"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User } from "lucide-react"
import { useMapContext } from "@/contexts/map-context"
import { getIndicatorValue, getIndicatorDefinitions } from "@/lib/supabase-client"
import type { Area, District, Neighborhood } from "@/lib/api-types"

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
  const [indicatorDefinitions, setIndicatorDefinitions] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialMessageSent = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load indicator definitions
  useEffect(() => {
    async function loadIndicatorDefinitions() {
      try {
        const definitions = await getIndicatorDefinitions()
        setIndicatorDefinitions(definitions)
      } catch (error) {
        console.error("Error loading indicator definitions:", error)
      }
    }
    loadIndicatorDefinitions()
  }, [])

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
    if (!initialMessageSent.current) return

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set a new timeout to send the message
    timeoutRef.current = setTimeout(() => {
      if (selectedCity && !selectedArea) {
        const cityMessage: Message = {
          id: Date.now().toString(),
          content: `You're now viewing ${selectedCity.name}. Select a district or neighborhood to see more details.`,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, cityMessage])
      } else if (selectedArea) {
        const areaType = 'district_id' in selectedArea ? "neighborhood" : "district"
        const areaMessage: Message = {
          id: Date.now().toString(),
          content: `You've selected the ${areaType} ${selectedArea.name}. I can provide information about:\n` +
            `- Population\n` +
            `- Income levels\n` +
            `- Education levels\n\n` +
            `Are you queryous about this area? What would you like to know?`,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, areaMessage])
      }
    }, 100)

    // Cleanup function to clear the timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [selectedCity?.id, selectedArea?.id])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
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

    // Generate bot response based on real data
    const botResponse = await generateBotResponse(inputValue)
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: botResponse,
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, botMessage])
  }

  const generateBotResponse = async (query: string): Promise<string> => {
    const lowerQuery = query.toLowerCase()

    if (!selectedCity) {
      return "Please select a city first to explore the data."
    }

    if (!selectedArea && !lowerQuery.includes("city") && !lowerQuery.includes(selectedCity.name.toLowerCase())) {
      return `I can provide more specific information if you select an area in ${selectedCity.name}. What would you like to know about the city in general?`
    }

    try {
      // Get relevant indicators based on the query
      const educationIndicator = indicatorDefinitions.find(ind => ind.name.toLowerCase().includes("education"))
      const incomeIndicator = indicatorDefinitions.find(ind => ind.name.toLowerCase().includes("income"))
      const populationIndicator = indicatorDefinitions.find(ind => ind.name.toLowerCase().includes("population"))

      console.log("Found indicators:", {
        education: educationIndicator?.id,
        income: incomeIndicator?.id,
        population: populationIndicator?.id
      })

      // Determine the correct granularity level
      const granularity = selectedArea && 'district_id' in selectedArea ? "neighborhood" : "district"

      // Check if the query contains any of our known indicators
      const hasKnownIndicator = lowerQuery.includes("population") ||
        lowerQuery.includes("income") ||
        lowerQuery.includes("salary") ||
        lowerQuery.includes("education") ||
        lowerQuery.includes("school") ||
        lowerQuery.includes("compare")

      if (!hasKnownIndicator) {
        return `I'm sorry, I don't have information about that. I can provide data about:\n` +
          `- Population\n` +
          `- Income levels\n` +
          `- Education levels\n\n` +
          `Are you queryous about ${selectedArea ? selectedArea.name : selectedCity.name}? What would you like to know?`
      }

      if (lowerQuery.includes("population")) {
        if (selectedArea && populationIndicator) {
          try {
            console.log("Fetching population for:", {
              areaId: selectedArea.id,
              indicatorId: populationIndicator.id,
              granularity
            })
            const population = await getIndicatorValue(selectedArea.id, populationIndicator.id, granularity)
            console.log("Population value:", population)
            return `The population of ${selectedArea.name} is ${population?.toLocaleString() || "unknown"} residents.\n\nAre you queryous about anything else? Shoot! 🎯`
          } catch (error) {
            console.error("Error fetching population:", error)
            return `I'm sorry, I couldn't fetch the population data for ${selectedArea.name}. Please try again.`
          }
        } else {
          return `${selectedCity.name} has multiple districts with varying population sizes. Select a specific area to see detailed population data.`
        }
      } else if (lowerQuery.includes("income") || lowerQuery.includes("salary")) {
        if (selectedArea && incomeIndicator) {
          try {
            const income = await getIndicatorValue(selectedArea.id, incomeIndicator.id, granularity)
            return `The average income in ${selectedArea.name} is €${income?.toLocaleString() || "unknown"} per person.\n\nAre you queryous about anything else? Shoot! 🎯`
          } catch (error) {
            console.error("Error fetching income:", error)
            return `I'm sorry, I couldn't fetch the income data for ${selectedArea.name}. Please try again.`
          }
        } else {
          return `Income levels vary across ${selectedCity.name}. Select a specific area to see detailed income data.`
        }
      } else if (lowerQuery.includes("education") || lowerQuery.includes("school")) {
        if (selectedArea && educationIndicator) {
          try {
            const education = await getIndicatorValue(selectedArea.id, educationIndicator.id, granularity)
            return `The education level in ${selectedArea.name} is ${education?.toLocaleString() || "unknown"}%.\n\nAre you queryous about anything else? Shoot! 🎯`
          } catch (error) {
            console.error("Error fetching education:", error)
            return `I'm sorry, I couldn't fetch the education data for ${selectedArea.name}. Please try again.`
          }
        } else {
          return `Education levels vary across ${selectedCity.name}. Select a specific area to see detailed education data.`
        }
      } else if (lowerQuery.includes("compare")) {
        if (selectedArea) {
          try {
            const education = educationIndicator ? await getIndicatorValue(selectedArea.id, educationIndicator.id, granularity) : null
            const income = incomeIndicator ? await getIndicatorValue(selectedArea.id, incomeIndicator.id, granularity) : null
            const population = populationIndicator ? await getIndicatorValue(selectedArea.id, populationIndicator.id, granularity) : null

            return `Here's a comparison for ${selectedArea.name}:\n` +
              `- Population: ${population?.toLocaleString() || "unknown"}\n` +
              `- Average Income: €${income?.toLocaleString() || "unknown"}\n` +
              `- Education Level: ${education?.toLocaleString() || "unknown"}%\n\n` +
              `Are you queryous about anything else? Shoot! 🎯`
          } catch (error) {
            console.error("Error fetching comparison data:", error)
            return `I'm sorry, I couldn't fetch the comparison data for ${selectedArea.name}. Please try again.`
          }
        } else {
          return `To compare areas, first select a district or neighborhood on the map.`
        }
      } else if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
        return `Hello! I'm here to help you explore ${selectedCity ? selectedCity.name : "the map"}. What would you like to know?`
      } else {
        return `I can provide information about population, income, education, and other indicators for ${selectedArea ? selectedArea.name : selectedCity.name}. What specific data would you like to know?`
      }
    } catch (error) {
      console.error("Error generating bot response:", error)
      return "I'm sorry, I encountered an error while fetching the data. Please try again."
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
                className={`max-w-[80%] rounded-lg p-3 ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border"
                  }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.sender === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  <span className="text-xs font-medium">{message.sender === "user" ? "You" : "Assistant"}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
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
