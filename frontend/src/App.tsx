import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Layout from "./components/layout/Layout"
import type { ActiveTab } from "./components/layout/Sidebar"
import Dashboard from "./pages/Dashboard"
import DocumentManager from "./pages/DocumentManager"
import type { DocumentItem } from "./pages/DocumentManager"
import AIChat from "./pages/AIChat"
import AnalyticsView from "./pages/AnalyticsView"
import SettingsView from "./pages/SettingsView"
import LoginPage from "./pages/LoginPage"
import type { UserProfile } from "./pages/LoginPage"
import type { WorkspaceItem } from "./components/layout/Navbar"
import { ThemeProvider } from "./components/ThemeProvider"
import api from "./services/api"
import { toast } from "sonner"

function MainApp() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("user_profile")
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard")
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [chatSeedQuestion, setChatSeedQuestion] = useState<string>("")
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [newChatToken, setNewChatToken] = useState<number>(0)
  const [sessionRefreshKey, setSessionRefreshKey] = useState<number>(0)
  
  // Workspaces State
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([
    { workspace_id: "ws-default", name: "General Knowledge Workspace" }
  ])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    return localStorage.getItem("active_workspace_id") || "ws-default"
  })

  // Fetch Workspaces from Backend
  async function fetchWorkspaces() {
    try {
      const res = await api.get(`/workspaces?user_id=${user?.user_id || "default"}`)
      if (res.data && Array.isArray(res.data.workspaces) && res.data.workspaces.length > 0) {
        setWorkspaces(res.data.workspaces)
      }
    } catch (e) {
      console.error("Failed to fetch workspaces", e)
    }
  }

  // Fetch Documents
  async function fetchDocuments() {
    try {
      const response = await api.get(`/documents?workspace_id=${activeWorkspaceId}`)
      if (response.data && Array.isArray(response.data.documents)) {
        setDocuments(response.data.documents)
      } else {
        setDocuments([])
      }
    } catch (error) {
      console.error("Failed to fetch documents from FastAPI backend", error)
      setDocuments([])
    }
  }

  useEffect(() => {
    if (user) {
      fetchWorkspaces()
      fetchDocuments()
    }
  }, [user, activeWorkspaceId])

  const handleLoginSuccess = (userProfile: UserProfile, token: string) => {
    setUser(userProfile)
    localStorage.setItem("user_profile", JSON.stringify(userProfile))
    localStorage.setItem("user_token", token)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("user_profile")
    localStorage.removeItem("user_token")
    toast.info("Logged out successfully. You can now log in with a different account.")
  }

  const handleCreateWorkspace = async (name: string, description: string) => {
    try {
      const res = await api.post("/workspaces", {
        name,
        description,
        user_id: user?.user_id || "default"
      })
      const newWs = res.data.workspace
      setWorkspaces((prev) => [newWs, ...prev])
      setActiveWorkspaceId(newWs.workspace_id)
      localStorage.setItem("active_workspace_id", newWs.workspace_id)
    } catch (e) {
      console.error("Failed to create workspace", e)
      toast.error("Failed to create workspace")
    }
  }

  const handleSelectWorkspace = (wsId: string) => {
    setActiveWorkspaceId(wsId)
    localStorage.setItem("active_workspace_id", wsId)
    toast.success(`Switched to ${workspaces.find(w => w.workspace_id === wsId)?.name || "workspace"}`)
  }

  const handleNavigate = (tab: ActiveTab, question?: string) => {
    if (question) {
      setChatSeedQuestion(question)
    }
    setActiveTab(tab)
  }

  const handleAskDocument = (filename: string) => {
    setChatSeedQuestion(`Provide a detailed summary of ${filename}`)
    setActiveTab("chat")
  }

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    setActiveTab("chat")
  }

  const handleNewChat = () => {
    setSelectedSessionId(null)
    setChatSeedQuestion("")
    setNewChatToken((prev) => prev + 1)
    setActiveTab("chat")
  }

  const handleSessionUpdated = () => {
    setSessionRefreshKey((prev) => prev + 1)
  }

  // If not logged in, render LoginPage
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  const activeWsName = workspaces.find(w => w.workspace_id === activeWorkspaceId)?.name || "General Knowledge Workspace"

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      docCount={documents.length}
      sessionRefreshKey={sessionRefreshKey}
      onUploadSuccess={fetchDocuments}
      onSelectSession={handleSelectSession}
      onNewChat={handleNewChat}
      workspaces={workspaces}
      activeWorkspaceId={activeWorkspaceId}
      onSelectWorkspace={handleSelectWorkspace}
      onCreateWorkspace={handleCreateWorkspace}
      onLogout={handleLogout}
      userName={user.username}
      userEmail={user.email}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === "dashboard" && (
            <Dashboard
              documents={documents}
              onRefresh={fetchDocuments}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === "documents" && (
            <DocumentManager
              documents={documents}
              onRefresh={fetchDocuments}
              onAskDocument={handleAskDocument}
            />
          )}

          {activeTab === "chat" && (
            <AIChat
              initialQuestion={chatSeedQuestion}
              documentsCount={documents.length}
              selectedSessionId={selectedSessionId}
              newChatToken={newChatToken}
              onSessionUpdated={handleSessionUpdated}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsView documents={documents} />
          )}

          {activeTab === "settings" && (
            <SettingsView
              user={user}
              onLogout={handleLogout}
              activeWorkspaceName={activeWsName}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <MainApp />
    </ThemeProvider>
  )
}