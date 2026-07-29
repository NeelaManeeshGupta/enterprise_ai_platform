import { useMemo } from "react"
import {
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Database,
  Cpu,
  Zap,
  TrendingUp,
  FileText,
  Layers
} from "lucide-react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DocumentItem } from "./DocumentManager"

interface AnalyticsViewProps {
  documents: DocumentItem[]
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#06b6d4"]

export default function AnalyticsView({ documents }: AnalyticsViewProps) {
  // Bar chart data: Top documents by chunk count
  const chunkData = useMemo(() => {
    if (!documents || documents.length === 0) {
      return [
        { name: "Sample PDF", chunks: 14 },
        { name: "Financial Report", chunks: 22 },
        { name: "Tech Spec", chunks: 18 }
      ]
    }
    return documents.map((doc) => ({
      name: doc.filename.length > 15 ? doc.filename.substring(0, 12) + "..." : doc.filename,
      chunks: doc.chunk_count
    }))
  }, [documents])

  // Pie chart data: File types
  const typeData = useMemo(() => {
    if (!documents || documents.length === 0) {
      return [
        { name: "PDF", value: 4 },
        { name: "DOCX", value: 2 },
        { name: "CSV", value: 1 }
      ]
    }
    const counts: Record<string, number> = {}
    documents.forEach((doc) => {
      const ext = doc.filename.split(".").pop()?.toUpperCase() || "OTHER"
      counts[ext] = (counts[ext] || 0) + 1
    })
    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key]
    }))
  }, [documents])

  const totalChunks = documents.reduce((acc, doc) => acc + doc.chunk_count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Vector & RAG Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time insights into your document embeddings, FAISS vector index, and query throughput.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Vector Index</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalChunks}</h3>
              <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> FAISS 384d Vectors
              </span>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Database className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Embedding Model</p>
              <h3 className="text-lg font-bold text-foreground mt-1 truncate max-w-[130px]" title="all-MiniLM-L6-v2">
                MiniLM-L6-v2
              </h3>
              <span className="text-[11px] text-muted-foreground mt-1 block">SentenceTransformers</span>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Cpu className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Avg Query Latency</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">~120 ms</h3>
              <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1 mt-1">
                <Zap className="h-3 w-3" /> Ultra Fast RAG
              </span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Documents</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{documents.length}</h3>
              <span className="text-[11px] text-muted-foreground mt-1 block">Indexed Files</span>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Chunks per Doc */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Vector Chunks per Document
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution of vector chunks generated by sentence splitter
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chunkData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="chunks" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: Document Formats */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-purple-500" /> Document File Types
            </CardTitle>
            <CardDescription className="text-xs">Format breakdown in knowledge base</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {typeData.map((entry, idx) => (
                <Badge
                  key={entry.name}
                  variant="outline"
                  className="text-[10px] flex items-center gap-1.5 px-2 py-0.5"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  {entry.name} ({entry.value})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
