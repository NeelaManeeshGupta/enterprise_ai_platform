import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
  Database,
  Plus,
  MessageCircle,
  Trash2,
  LogOut
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import api from "@/services/api"

export type ActiveTab = "dashboard" | "documents" | "chat" | "analytics" | "settings"

interface ConversationSession {
  session_id: string
  title: string
  created_at: string
  updated_at: string
}

interface SidebarProps {
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  docCount?: number
  sessionRefreshKey?: number
  onSelectSession?: (sessionId: string) => void
  onNewChat?: () => void
  userName?: string
  userEmail?: string
  onLogout?: () => void
}

const menuItems = [
  {
    id: "dashboard" as ActiveTab,
    name: "Dashboard",
    icon: LayoutDashboard,
    badge: null
  },
  {
    id: "documents" as ActiveTab,
    name: "Knowledge Hub",
    icon: FileText,
    badge: "Docs"
  },
  {
    id: "chat" as ActiveTab,
    name: "AI Copilot",
    icon: MessageSquare,
    badge: "Agent RAG"
  },
  {
    id: "analytics" as ActiveTab,
    name: "Analytics",
    icon: BarChart3,
    badge: null
  },
  {
    id: "settings" as ActiveTab,
    name: "Settings",
    icon: Settings,
    badge: null
  }
]

export default function Sidebar({
  activeTab,
  setActiveTab,
  docCount = 0,
  sessionRefreshKey = 0,
  onSelectSession,
  onNewChat,
  userName = "Enterprise User",
  userEmail,
  onLogout
}: SidebarProps) {
  const [serverOnline, setServerOnline] = useState<boolean | null>(null)
  const [conversations, setConversations] = useState<ConversationSession[]>([])

  async function fetchConversations() {
    try {
      const convRes = await api.get("/conversations")
      if (convRes.data && Array.isArray(convRes.data.sessions)) {
        setConversations(convRes.data.sessions)
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err)
    }
  }

  useEffect(() => {
    async function checkHealthAndSessions() {
      try {
        const res = await api.get("/ping", { timeout: 15000 })
        setServerOnline(res.data?.status === "healthy")
        await fetchConversations()
      } catch {
        setServerOnline(false)
      }
    }

    checkHealthAndSessions()
    const interval = setInterval(checkHealthAndSessions, 10000)
    return () => clearInterval(interval)
  }, [activeTab])

  useEffect(() => {
    fetchConversations()
  }, [sessionRefreshKey])

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    try {
      await api.delete(`/conversations/${sessionId}`)
      setConversations((prev) => prev.filter((s) => s.session_id !== sessionId))
    } catch (err) {
      console.error("Failed to delete session", err)
    }
  }

  // Generate initials (e.g., MG for Maneesh Gupta)
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "EU"

  return (
    <aside className="h-screen w-64 border-r border-border/60 bg-sidebar flex flex-col justify-between p-4 sticky top-0 transition-all z-20">
      <div className="space-y-5 overflow-y-auto pr-1">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
              Enterprise AI
            </h1>
            <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">
              Agentic Copilot
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          <div className="px-3 pb-1.5 text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
            Platform Menu
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.id === "documents" && docCount > 0 && (
                    <Badge variant={isActive ? "secondary" : "outline"} className="text-[10px] h-5 px-1.5">
                      {docCount}
                    </Badge>
                  )}
                  {item.badge && item.id !== "documents" && (
                    <Badge variant={isActive ? "secondary" : "outline"} className="text-[10px] h-5 px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-80" />}
                </div>
              </button>
            )
          })}
        </nav>

        {/* ChatGPT / Gemini Style Saved Conversations */}
        <div className="space-y-1.5 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
              Recent Chats ({conversations.length})
            </span>
            {onNewChat && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveTab("chat")
                  onNewChat()
                }}
                className="h-6 px-1.5 text-[11px] text-primary hover:bg-primary/10 rounded-md cursor-pointer"
                title="Start New Chat"
              >
                <Plus className="h-3.5 w-3.5 mr-0.5" /> New
              </Button>
            )}
          </div>

          {conversations.length === 0 ? (
            <p className="text-[11px] text-muted-foreground px-3 italic py-1">
              No saved chat sessions
            </p>
          ) : (
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {conversations.map((conv) => (
                <div
                  key={conv.session_id}
                  onClick={() => {
                    setActiveTab("chat")
                    if (onSelectSession) onSelectSession(conv.session_id)
                  }}
                  className="group flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate pr-1">
                    <MessageCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate max-w-[130px]" title={conv.title}>
                      {conv.title}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteSession(e, conv.session_id)}
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:text-destructive text-slate-400 transition-opacity"
                    title="Delete Chat"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Status & User Card Box */}
      <div className="space-y-3 pt-3 border-t border-border/50">
        <div className="rounded-xl p-3 bg-muted/60 backdrop-blur-sm border border-border/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-blue-500" /> FAISS Vector Index
            </span>
            <span className="text-emerald-500 font-semibold text-[11px]">Active</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-border/30">
            <span className="text-muted-foreground text-[11px]">Backend API</span>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${serverOnline ? "bg-emerald-500 animate-pulse" : serverOnline === false ? "bg-amber-500" : "bg-slate-400"}`} />
              <span className="text-[11px] font-medium">
                {serverOnline === true ? "Connected" : serverOnline === false ? "Offline/Mock" : "Checking..."}
              </span>
            </div>
          </div>
        </div>

        {/* User Account Profile Card */}
        <div className="flex items-center justify-between px-2 py-1 bg-muted/40 rounded-xl border border-border/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate" title={userName}>
                {userName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate" title={userEmail || "Admin Account"}>
                {userEmail || "Admin Workspace"}
              </p>
            </div>
          </div>

          {onLogout && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0 cursor-pointer"
              title="Log Out & Switch Account"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}