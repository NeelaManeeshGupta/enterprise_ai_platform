import React from "react"
import Sidebar from "./Sidebar"
import type { ActiveTab } from "./Sidebar"
import Navbar from "./Navbar"
import type { WorkspaceItem } from "./Navbar"
import { Toaster } from "@/components/ui/sonner"

interface LayoutProps {
  children: React.ReactNode
  activeTab: ActiveTab
  setActiveTab: (tab: ActiveTab) => void
  docCount?: number
  sessionRefreshKey?: number
  onUploadSuccess?: () => void
  onSelectSession?: (sessionId: string) => void
  onNewChat?: () => void
  workspaces?: WorkspaceItem[]
  activeWorkspaceId?: string
  onSelectWorkspace?: (wsId: string) => void
  onCreateWorkspace?: (name: string, description: string) => void
  onLogout?: () => void
  userName?: string
  userEmail?: string
}

const tabTitles: Record<ActiveTab, string> = {
  dashboard: "Executive AI Dashboard",
  documents: "Knowledge Document Hub",
  chat: "Interactive AI Copilot",
  analytics: "Vector & RAG Analytics",
  settings: "Platform Configuration"
}

export default function Layout({
  children,
  activeTab,
  setActiveTab,
  docCount = 0,
  sessionRefreshKey = 0,
  onUploadSuccess,
  onSelectSession,
  onNewChat,
  workspaces = [],
  activeWorkspaceId = "ws-default",
  onSelectWorkspace,
  onCreateWorkspace,
  onLogout,
  userName,
  userEmail
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex relative selection:bg-primary/20 selection:text-primary">
      {/* Background ambient lighting effects */}
      <div className="fixed top-0 left-64 w-[500px] h-[300px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[300px] bg-purple-500/10 dark:bg-purple-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        docCount={docCount}
        sessionRefreshKey={sessionRefreshKey}
        onSelectSession={onSelectSession}
        onNewChat={onNewChat}
        userName={userName}
        userEmail={userEmail}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTitle={tabTitles[activeTab]}
          onUploadSuccess={onUploadSuccess}
          onSearchClick={() => setActiveTab("documents")}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={onSelectWorkspace}
          onCreateWorkspace={onCreateWorkspace}
          onLogout={onLogout}
          userName={userName}
        />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      <Toaster position="bottom-right" richColors />
    </div>
  )
}