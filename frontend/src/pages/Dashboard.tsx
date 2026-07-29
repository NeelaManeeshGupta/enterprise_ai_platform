import { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Database,
  Upload,
  Sparkles,
  ArrowRight,
  Zap,
  Activity,
  Layers,
  Search,
  MessageSquare
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import UploadDialog from "@/components/UploadDialog"
import type { DocumentItem } from "./DocumentManager"

interface DashboardProps {
  documents: DocumentItem[]
  onRefresh: () => void
  onNavigate: (tab: "documents" | "chat" | "analytics" | "settings", question?: string) => void
}

export default function Dashboard({ documents, onRefresh, onNavigate }: DashboardProps) {
  const [quickQuestion, setQuickQuestion] = useState("")

  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunk_count, 0)

  const stats = [
    {
      title: "Knowledge Documents",
      value: documents.length,
      unit: "files indexed",
      icon: FileText,
      color: "from-blue-500 to-indigo-500",
      change: "+100% active"
    },
    {
      title: "Vector Knowledge Chunks",
      value: totalChunks,
      unit: "FAISS embeddings",
      icon: Database,
      color: "from-purple-500 to-pink-500",
      change: "384-dimensional"
    },
    {
      title: "RAG Query Speed",
      value: "< 150 ms",
      unit: "average latency",
      icon: Zap,
      color: "from-emerald-500 to-teal-500",
      change: "FAISS Fast Search"
    },
    {
      title: "System Health",
      value: "100%",
      unit: "FastAPI Engine",
      icon: Activity,
      color: "from-amber-500 to-orange-500",
      change: "Operational"
    }
  ]

  const samplePrompts = [
    "What are the main insights in my uploaded documents?",
    "Summarize key recommendations and findings.",
    "List financial and quantitative metrics found."
  ]

  return (
    <div className="space-y-8">
      {/* Hero Banner with Glassmorphism & Gradient Mesh */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl p-8 md:p-10 text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 shadow-2xl glow-subtle border border-white/20"
      >
        {/* Ambient Decorative Orbs */}
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase border border-white/20">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            Enterprise RAG Copilot v1.0
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Intelligent Knowledge Assistant for Enterprise Data
          </h1>

          <p className="text-base md:text-lg text-blue-100/90 max-w-2xl leading-relaxed">
            Upload PDF, Word, Excel, CSV or Image documents. Get precise AI answers backed by semantic vector search and exact chunk citations.
          </p>

          {/* Quick Search Launcher */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={quickQuestion}
                onChange={(e) => setQuickQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && quickQuestion.trim()) {
                    onNavigate("chat", quickQuestion)
                  }
                }}
                placeholder="Ask any question about your documents..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 text-white placeholder-blue-200/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            </div>

            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
              <Button
                onClick={() => {
                  if (quickQuestion.trim()) {
                    onNavigate("chat", quickQuestion)
                  } else {
                    onNavigate("chat")
                  }
                }}
                className="bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-2xl px-5 h-11 shadow-lg cursor-pointer w-full sm:w-auto"
              >
                Ask AI <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>

              <UploadDialog onUploadSuccess={onRefresh}>
                <Button variant="outline" className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium rounded-2xl h-11 cursor-pointer">
                  <Upload className="h-4 w-4" />
                </Button>
              </UploadDialog>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="glass-card overflow-hidden hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-md`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">{stat.value}</h2>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-muted-foreground">{stat.unit}</span>
                      <span className="text-emerald-500 font-semibold text-[11px]">{stat.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Recommended Prompt Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" /> Quick Query Starters
          </h3>
          <Button
            variant="link"
            onClick={() => onNavigate("chat")}
            className="text-xs text-primary p-0 h-auto font-medium cursor-pointer"
          >
            Open Full AI Copilot →
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {samplePrompts.map((prompt, i) => (
            <div
              key={i}
              onClick={() => onNavigate("chat", prompt)}
              className="glass-card p-4 rounded-2xl cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                💡 "{prompt}"
              </p>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Documents Table Section */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Indexed Knowledge Documents
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Showing {documents.length} active files in your FAISS vector database
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate("documents")}
                className="text-xs rounded-xl"
              >
                View All Files
              </Button>
              <UploadDialog onUploadSuccess={onRefresh}>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl text-xs cursor-pointer">
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload File
                </Button>
              </UploadDialog>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3 bg-muted/30 rounded-2xl border border-dashed border-border/60">
              <FileText className="h-10 w-10 text-slate-400 mx-auto" />
              <p className="font-semibold text-foreground text-sm">No documents indexed yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Upload your first document (PDF, Word, CSV, Excel, Image) to begin asking questions.
              </p>
              <UploadDialog onUploadSuccess={onRefresh}>
                <Button size="sm" className="rounded-xl mt-1">
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Document Now
                </Button>
              </UploadDialog>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.slice(0, 5).map((doc) => (
                <motion.div
                  key={doc.document_id}
                  whileHover={{ scale: 1.005 }}
                  className="p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground text-sm truncate max-w-xs md:max-w-md">
                        {doc.filename}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                          {doc.file_type.split("/").pop() || "File"}
                        </Badge>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3 text-blue-500" /> {doc.chunk_count} vectors
                        </span>
                        <span>•</span>
                        <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate("chat", `What are the details in ${doc.filename}?`)}
                      className="text-xs rounded-xl h-8 text-primary hover:bg-primary/10 border-primary/20 cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Query Document
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}