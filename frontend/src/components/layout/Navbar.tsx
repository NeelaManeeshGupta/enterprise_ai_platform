import { useState } from "react"
import {
  Search,
  Sun,
  Moon,
  Upload,
  Layers,
  Plus,
  LogOut,
  FolderPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { useTheme } from "@/components/ThemeProvider"
import UploadDialog from "@/components/UploadDialog"
import { toast } from "sonner"

export interface WorkspaceItem {
  workspace_id: string
  name: string
  description?: string
}

interface NavbarProps {
  onSearchClick?: () => void
  onUploadSuccess?: () => void
  activeTitle?: string
  workspaces?: WorkspaceItem[]
  activeWorkspaceId?: string
  onSelectWorkspace?: (wsId: string) => void
  onCreateWorkspace?: (name: string, description: string) => void
  onLogout?: () => void
  userName?: string
}

export default function Navbar({
  onSearchClick,
  onUploadSuccess,
  activeTitle = "Dashboard Overview",
  workspaces = [],
  activeWorkspaceId = "ws-default",
  onSelectWorkspace,
  onCreateWorkspace,
  onLogout,
  userName
}: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newWsName, setNewWsName] = useState("")
  const [newWsDesc, setNewWsDesc] = useState("")

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWsName.trim()) return
    if (onCreateWorkspace) {
      onCreateWorkspace(newWsName.trim(), newWsDesc.trim())
    }
    setNewWsName("")
    setNewWsDesc("")
    setIsCreateOpen(false)
    toast.success("Workspace created!")
  }

  const activeWs = workspaces.find((w) => w.workspace_id === activeWorkspaceId) || {
    workspace_id: "ws-default",
    name: "General Workspace"
  }

  return (
    <header className="h-16 border-b border-border/60 glass-panel sticky top-0 z-10 px-6 flex items-center justify-between transition-all">
      {/* Title & Workspace Selector */}
      <div className="flex items-center gap-4 md:gap-6">
        <div>
          <h2 className="font-bold text-lg text-foreground tracking-tight flex items-center gap-2">
            {activeTitle}
          </h2>
        </div>

        {/* Workspace Dropdown Selector */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
            <Layers className="h-3.5 w-3.5" />
            <select
              value={activeWorkspaceId}
              onChange={(e) => {
                if (e.target.value === "CREATE_NEW") {
                  setIsCreateOpen(true)
                } else if (onSelectWorkspace) {
                  onSelectWorkspace(e.target.value)
                }
              }}
              className="bg-transparent border-0 font-semibold focus:outline-none cursor-pointer pr-2 text-primary"
            >
              {workspaces.map((ws) => (
                <option key={ws.workspace_id} value={ws.workspace_id} className="bg-background text-foreground">
                  🏢 {ws.name}
                </option>
              ))}
              <option value="CREATE_NEW" className="bg-background text-primary font-bold">
                ➕ Create Workspace...
              </option>
            </select>
          </div>
        </div>

        {/* Global Search Bar */}
        <div
          onClick={onSearchClick}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/60 bg-background/50 hover:bg-muted/60 text-muted-foreground text-xs cursor-pointer w-56 transition-all"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search documents or ask AI...</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Connection status badge */}
        <Badge variant="outline" className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          RAG Engine Ready
        </Badge>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground cursor-pointer"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-90" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 rotate-0 hover:-rotate-45" />
          )}
        </Button>

        {/* Quick Upload CTA */}
        <UploadDialog onUploadSuccess={onUploadSuccess}>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 px-3.5">
            <Upload className="h-3.5 w-3.5" />
            <span>Upload</span>
          </Button>
        </UploadDialog>

        {/* Logout Button */}
        {onLogout && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="rounded-xl h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            title={`Log Out (${userName || "User"})`}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Create Workspace Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="glass-card sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <FolderPlus className="h-5 w-5" />
              <DialogTitle>Create New Workspace</DialogTitle>
            </div>
            <DialogDescription className="pt-1 text-xs">
              Organize documents, vector embeddings, and AI chats into isolated project workspaces.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Workspace Name</label>
              <Input
                placeholder="e.g. Financial Audit Q3"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Description (Optional)</label>
              <Input
                placeholder="Isolated document RAG workspace..."
                value={newWsDesc}
                onChange={(e) => setNewWsDesc(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl text-xs bg-primary text-primary-foreground font-semibold">
                <Plus className="h-3.5 w-3.5 mr-1" /> Create Workspace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}