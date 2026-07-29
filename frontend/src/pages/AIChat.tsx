import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  FileText,
  Layers,
  HelpCircle,
  Loader2,
  BookOpen,
  BrainCircuit,
  ShieldCheck,
  PlusCircle
} from "lucide-react"

import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import api from "@/services/api"

export interface SourceCitation {
  document: string
  chunk_id: number
}

export interface PlannerAgentData {
  intent: string
  tool_selected: string
  reasoning: string
  confidence_score: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: SourceCitation[]
  planner_agent?: PlannerAgentData
  timestamp: string
}

interface AIChatProps {
  initialQuestion?: string
  documentsCount?: number
  selectedSessionId?: string | null
  newChatToken?: number
  onSessionUpdated?: () => void
}

const STORAGE_KEY = "enterprise_ai_copilot_chat_history"
const STORAGE_SESSION_ID = "enterprise_ai_copilot_session_id"

const defaultWelcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hello! I am your Enterprise AI Copilot with Agentic RAG. Ask me anything about your uploaded documents, spreadsheet metrics, or security policies.",
  planner_agent: {
    intent: "general_rag",
    tool_selected: "Multi-Modal Agentic Knowledge Planner",
    reasoning: "System initialized with Document Intelligence & Confidence Estimation.",
    confidence_score: 98
  },
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const suggestedPrompts = [
  "Summarize the key findings across all uploaded documents.",
  "What are the main insights and metrics mentioned?",
  "List any recommendations or action items found in the knowledge base.",
  "Compare the details in the latest PDF uploads."
]

export default function AIChat({
  initialQuestion = "",
  documentsCount = 0,
  selectedSessionId = null,
  newChatToken = 0,
  onSessionUpdated
}: AIChatProps) {
  const [sessionId, setSessionId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_SESSION_ID) || "session-" + Date.now()
  })

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.error("Error loading chat from localStorage:", e)
    }
    return [defaultWelcomeMessage]
  })

  const [input, setInput] = useState(initialQuestion)
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load session from backend if selected from sidebar
  useEffect(() => {
    if (!selectedSessionId) return

    const sid = selectedSessionId
    async function loadSelectedSession() {
      try {
        const res = await api.get(`/conversations/${sid}`)
        if (res.data && Array.isArray(res.data.messages) && res.data.messages.length > 0) {
          setSessionId(sid)
          setMessages(res.data.messages)
          localStorage.setItem(STORAGE_SESSION_ID, sid)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.messages))
        }
      } catch (err) {
        console.error("Failed to load selected session", err)
      }
    }

    loadSelectedSession()
  }, [selectedSessionId])

  // Handle New Chat Trigger from Sidebar/Header
  useEffect(() => {
    if (newChatToken > 0) {
      handleStartNewChat()
    }
  }, [newChatToken])

  // Persist messages to localStorage & sync to Backend Conversation DB
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      localStorage.setItem(STORAGE_SESSION_ID, sessionId)

      const userMessages = messages.filter((m) => m.role === "user")
      if (userMessages.length > 0) {
        const firstUserQuery = userMessages[0].content
        const title = firstUserQuery.length > 30 ? firstUserQuery.slice(0, 30) + "..." : firstUserQuery

        api.post("/conversations", {
          session_id: sessionId,
          title: title,
          messages: messages
        }).then(() => {
          if (onSessionUpdated) onSessionUpdated()
        }).catch((e) => console.error("Error saving conversation session:", e))
      }
    } catch (e) {
      console.error("Error saving chat to localStorage:", e)
    }
  }, [messages, sessionId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Handle seed question passed from Dashboard/DocumentManager
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      setInput(initialQuestion)
    }
  }, [initialQuestion])

  async function handleSend(customText?: string) {
    const questionText = customText || input
    if (!questionText.trim() || loading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    try {
      const historyPayload = updatedMessages
        .filter((m) => m.id !== "welcome")
        .slice(-2)
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await api.post("/ask", {
        question: questionText,
        history: historyPayload
      })

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.answer || "I could not generate an answer based on the current documents.",
        sources: response.data.sources || [],
        planner_agent: response.data.planner_agent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages((prev) => [...prev, aiMsg])
    } catch (error: any) {
      console.error("AI chat error:", error)
      toast.error("Failed to query AI copilot backend")

      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I couldn't reach the backend server right now. Please verify your Python FastAPI server is running (`uvicorn app.main:app --reload`).",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Answer copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleStartNewChat = async () => {
    // 1. Save current session first if user messages exist
    const userMessages = messages.filter((m) => m.role === "user")
    if (userMessages.length > 0) {
      const firstQuery = userMessages[0].content
      const title = firstQuery.length > 30 ? firstQuery.slice(0, 30) + "..." : firstQuery

      try {
        await api.post("/conversations", {
          session_id: sessionId,
          title: title,
          messages: messages
        })
      } catch (e) {
        console.error("Failed to auto-save session before resetting", e)
      }
    }

    // 2. Create brand new session ID and reset message state
    const newSessionId = "session-" + Date.now()
    const resetMessages: ChatMessage[] = [
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: "Started a new conversation session. What would you like to explore in your knowledge base?",
        planner_agent: {
          intent: "general_rag",
          tool_selected: "Multi-Modal Agentic Knowledge Planner",
          reasoning: "New session initialized.",
          confidence_score: 98
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]

    setSessionId(newSessionId)
    setMessages(resetMessages)
    localStorage.setItem(STORAGE_SESSION_ID, newSessionId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetMessages))

    if (onSessionUpdated) onSessionUpdated()
    toast.success("New conversation started and previous chat saved!")
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary animate-pulse" /> Agentic AI Copilot
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Planner Agent + Multi-Turn Knowledge Graph & FAISS Vector Search.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
            <BookOpen className="h-3 w-3 mr-1" /> {documentsCount} Indexed Docs
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartNewChat}
            className="text-xs rounded-xl text-foreground hover:bg-muted h-8 cursor-pointer font-medium"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1 text-primary" /> New Chat
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <Card className="glass-card flex-1 overflow-y-auto p-4 md:p-6 space-y-6 rounded-2xl relative">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 md:gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div className={`space-y-2 max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                
                {/* Planner Agent Reasoning Card */}
                {msg.role === "assistant" && msg.planner_agent && (
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span className="flex items-center gap-1.5 text-primary">
                        <BrainCircuit className="h-4 w-4 text-indigo-500 animate-pulse" />
                        Planner Agent: <span className="text-foreground">{msg.planner_agent.tool_selected}</span>
                      </span>
                      <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] px-2 py-0.5 font-bold">
                        <ShieldCheck className="h-3 w-3 mr-1" /> {msg.planner_agent.confidence_score}% Confidence
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      <strong className="text-foreground">Agent Strategy:</strong> {msg.planner_agent.reasoning}
                    </p>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground font-medium rounded-tr-xs"
                      : "bg-muted/80 backdrop-blur-sm border border-border/50 text-foreground rounded-tl-xs"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {/* Sources & Citations with Confidence Evidence */}
                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-1"
                  >
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Layers className="h-3 w-3 text-blue-500" /> Grounded Evidence & Citations ({msg.sources.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/80 border border-border/60 text-xs text-foreground shadow-xs"
                        >
                          <FileText className="h-3 w-3 text-primary" />
                          <span className="font-medium max-w-[140px] truncate">{src.document}</span>
                          <Badge variant="secondary" className="text-[9px] h-4 px-1">
                            Chunk #{src.chunk_id}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Footer bar */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground px-1">
                  <span>{msg.timestamp}</span>
                  {msg.role === "assistant" && msg.id !== "welcome" && (
                    <div className="flex items-center gap-1 ml-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="h-6 w-6 rounded-md hover:bg-background cursor-pointer"
                        title="Copy Answer"
                      >
                        {copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSend(messages[messages.length - 2]?.content || "Explain further")}
                        className="h-6 w-6 rounded-md hover:bg-background cursor-pointer"
                        title="Regenerate"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="h-9 w-9 rounded-xl bg-slate-800 text-white dark:bg-slate-700 flex items-center justify-center shrink-0 shadow-md">
                  <User className="h-5 w-5" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Skeleton */}
        {loading && (
          <div className="flex gap-3 items-start">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="h-5 w-5" />
            </div>
            <div className="space-y-2 max-w-[70%]">
              <div className="p-4 rounded-2xl bg-muted/80 backdrop-blur-sm border border-border/50 space-y-2">
                <div className="flex items-center gap-2 text-xs text-primary font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Planner Agent evaluating query intent & evidence...
                </div>
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </Card>

      {/* Suggested prompts pills (if few messages) */}
      {messages.length <= 2 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-1">
            <HelpCircle className="h-3 w-3 text-primary" /> Suggested Starter Questions
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-xs bg-muted/60 hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border/60 rounded-xl px-3 py-1.5 transition-all text-left cursor-pointer"
              >
                💡 {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="flex items-center gap-2 glass-panel p-2 rounded-2xl border border-border/60 shadow-lg"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your uploaded documents, spreadsheets, or security policies..."
          disabled={loading}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
        />
        <Button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl h-10 px-4 shrink-0 shadow-md cursor-pointer"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  )
}
