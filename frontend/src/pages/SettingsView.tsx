import { useState } from "react"
import {
  Settings as SettingsIcon,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Moon,
  Sun,
  UserCheck,
  LogOut,
  ShieldCheck,
  Key
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/components/ThemeProvider"
import { toast } from "sonner"
import api from "@/services/api"
import type { UserProfile } from "./LoginPage"

interface SettingsViewProps {
  user?: UserProfile | null
  onLogout?: () => void
  activeWorkspaceName?: string
}

export default function SettingsView({ user, onLogout, activeWorkspaceName = "General Knowledge Workspace" }: SettingsViewProps) {
  const { theme, setTheme } = useTheme()
  const [testingConnection, setTestingConnection] = useState(false)
  const [pingResult, setPingResult] = useState<{ status: string; time: number } | null>(null)

  async function testBackendPing() {
    setTestingConnection(true)
    const startTime = performance.now()
    try {
      const response = await api.get("/ping")
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)

      setPingResult({
        status: response.data?.status || "healthy",
        time: duration
      })

      toast.success("Backend API is online and healthy!", {
        description: `Ping response: ${duration} ms`
      })
    } catch {
      setPingResult({ status: "offline", time: 0 })
      toast.error("Could not connect to FastAPI server at http://127.0.0.1:8000")
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" /> User Profile & Platform Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Inspect your active account profile, switch workspaces, test backend API connectivity, and manage UI themes.
        </p>
      </div>

      {/* User Account Profile Card */}
      <Card className="glass-card border border-primary/20 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <UserCheck className="h-5 w-5 text-primary" /> Active User Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Your authenticated session and active enterprise workspace credentials
              </CardDescription>
            </div>

            {onLogout && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="rounded-xl text-xs text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer font-semibold"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" /> Log Out & Switch Account
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/40 rounded-2xl border border-border/40">
            <div>
              <p className="text-xs text-muted-foreground">Account Name</p>
              <p className="font-semibold text-foreground text-sm mt-0.5">{user?.username || "Enterprise Admin"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Work Email</p>
              <p className="font-semibold text-primary text-sm mt-0.5">{user?.email || "admin@enterprise.ai"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Workspace</p>
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 mt-1 font-semibold">
                🏢 {activeWorkspaceName}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Authenticated Session Token: <code className="font-mono text-[11px] text-foreground">token_{user?.user_id?.slice(0, 8) || "admin"}</code>
            </span>
            <span className="flex items-center gap-1">
              <Key className="h-3.5 w-3.5 text-amber-500" /> Multi-Tenant Role: Admin
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Backend Connection Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-500" /> Backend API Server
          </CardTitle>
          <CardDescription className="text-xs">
            FastAPI endpoint configuration and real-time diagnostic test
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-muted/40 rounded-xl">
            <div>
              <p className="text-xs text-muted-foreground">Server Base URL</p>
              <p className="font-mono text-sm font-semibold text-foreground mt-0.5">
                http://127.0.0.1:8000
              </p>
            </div>

            <div className="flex items-center gap-3">
              {pingResult && (
                <Badge
                  variant="outline"
                  className={`text-xs px-2.5 py-1 ${
                    pingResult.status === "healthy"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}
                >
                  {pingResult.status === "healthy" ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Healthy ({pingResult.time} ms)
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Offline
                    </>
                  )}
                </Badge>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={testBackendPing}
                disabled={testingConnection}
                className="rounded-xl text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${testingConnection ? "animate-spin" : ""}`} />
                Test Ping
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 border border-border/50 rounded-xl">
              <p className="text-muted-foreground">Upload Endpoint</p>
              <p className="font-mono text-foreground font-medium mt-1">POST /upload</p>
            </div>
            <div className="p-3 border border-border/50 rounded-xl">
              <p className="text-muted-foreground">Documents Endpoint</p>
              <p className="font-mono text-foreground font-medium mt-1">GET /documents</p>
            </div>
            <div className="p-3 border border-border/50 rounded-xl">
              <p className="text-muted-foreground">RAG Question Endpoint</p>
              <p className="font-mono text-foreground font-medium mt-1">POST /ask</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vector Store Configuration */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-500" /> Vector Index & Chunker Settings
          </CardTitle>
          <CardDescription className="text-xs">
            Current chunking strategy and embedding parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border/50 rounded-xl space-y-1">
              <p className="text-xs text-muted-foreground">Vector Database</p>
              <p className="font-semibold text-foreground">FAISS (Facebook AI Similarity Search)</p>
              <p className="text-[11px] text-muted-foreground">IndexFlatIP / Cosine Similarity</p>
            </div>
            <div className="p-4 border border-border/50 rounded-xl space-y-1">
              <p className="text-xs text-muted-foreground">Embedding Model</p>
              <p className="font-semibold text-foreground">BAAI/bge-small-en-v1.5</p>
              <p className="text-[11px] text-muted-foreground">384-dimensional dense vectors</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance & Theme */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500" /> Appearance & Theme
          </CardTitle>
          <CardDescription className="text-xs">Customize application look and feel</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Color Mode</p>
            <p className="text-xs text-muted-foreground">Switch between Dark and Light mode</p>
          </div>

          <div className="flex items-center border border-border/60 rounded-xl p-1 bg-background/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme("dark")}
              className={`h-8 px-3 rounded-lg text-xs ${theme === "dark" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"}`}
            >
              <Moon className="h-3.5 w-3.5 mr-1.5" /> Dark
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme("light")}
              className={`h-8 px-3 rounded-lg text-xs ${theme === "light" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"}`}
            >
              <Sun className="h-3.5 w-3.5 mr-1.5" /> Light
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
