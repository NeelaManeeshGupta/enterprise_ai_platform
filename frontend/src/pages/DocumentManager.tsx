import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Trash2,
  Search,
  Grid,
  List as ListIcon,
  Eye,
  MessageSquare,
  Upload,
  Calendar,
  Layers,
  FileCheck,
  AlertCircle,
  Shield,
  User,
  DollarSign,
  BarChart2,
  Sparkles
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

import { toast } from "sonner"
import api from "@/services/api"
import UploadDialog from "@/components/UploadDialog"

export interface DocumentItem {
  document_id: number
  filename: string
  file_type: string
  chunk_count: number
  category?: string
  processing_strategy?: string
  uploaded_at: string
}

interface DocumentManagerProps {
  documents: DocumentItem[]
  onRefresh: () => void
  onAskDocument: (filename: string) => void
}

export default function DocumentManager({ documents, onRefresh, onAskDocument }: DocumentManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deletingName, setDeletingName] = useState<string>("")
  const [inspectDoc, setInspectDoc] = useState<DocumentItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.category && doc.category.toLowerCase().includes(searchQuery.toLowerCase()))
    if (selectedType === "all") return matchesSearch
    return matchesSearch && doc.file_type.toLowerCase().includes(selectedType.toLowerCase())
  })

  async function handleDeleteConfirm() {
    if (!deletingId) return
    try {
      setIsDeleting(true)
      await api.delete(`/documents/${deletingId}`)
      toast.success(`Deleted ${deletingName}`, {
        description: "Vector embeddings removed from FAISS store."
      })
      onRefresh()
    } catch (error) {
      console.error("Failed to delete document", error)
      toast.error("Failed to delete document")
    } finally {
      setIsDeleting(false)
      setDeletingId(null)
    }
  }

  const getCategoryBadge = (category?: string) => {
    if (!category) return <Badge variant="outline" className="text-[10px]">Enterprise Data</Badge>
    if (category.includes("Resume") || category.includes("Talent")) {
      return <Badge variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 flex items-center gap-1"><User className="h-3 w-3" /> {category}</Badge>
    }
    if (category.includes("Security") || category.includes("Governance")) {
      return <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 flex items-center gap-1"><Shield className="h-3 w-3" /> {category}</Badge>
    }
    if (category.includes("Financial") || category.includes("Receipt")) {
      return <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 flex items-center gap-1"><DollarSign className="h-3 w-3" /> {category}</Badge>
    }
    if (category.includes("Quantitative") || category.includes("Data")) {
      return <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 flex items-center gap-1"><BarChart2 className="h-3 w-3" /> {category}</Badge>
    }
    return <Badge variant="outline" className="text-[10px]">{category}</Badge>
  }

  const getFileBadgeColor = (fileType: string) => {
    if (fileType.includes("pdf")) return "bg-red-500/10 text-red-500 border-red-500/20"
    if (fileType.includes("word") || fileType.includes("docx")) return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    if (fileType.includes("csv") || fileType.includes("sheet") || fileType.includes("excel")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    if (fileType.includes("image") || fileType.includes("png") || fileType.includes("jpeg")) return "bg-purple-500/10 text-purple-500 border-purple-500/20"
    return "bg-slate-500/10 text-slate-500 border-slate-500/20"
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> Multi-Modal Knowledge Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Domain-classified document pipeline with specialized Planner Agent routing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <UploadDialog onUploadSuccess={onRefresh}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-md cursor-pointer">
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </UploadDialog>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-background/60"
          />
        </div>

        {/* Filter Pills & View Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {["all", "pdf", "docx", "csv", "image"].map((type) => (
              <Badge
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                onClick={() => setSelectedType(type)}
                className={`cursor-pointer capitalize px-3 py-1 text-xs rounded-lg transition-all ${
                  selectedType === type ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {type === "all" ? "All Files" : type.toUpperCase()}
              </Badge>
            ))}
          </div>

          <div className="flex items-center border border-border/60 rounded-xl p-1 bg-background/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-7 px-2.5 rounded-lg ${viewMode === "grid" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"}`}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("table")}
              className={`h-7 px-2.5 rounded-lg ${viewMode === "table" ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"}`}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 ? (
        <Card className="glass-card text-center py-16 px-4">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-muted/80 rounded-2xl text-muted-foreground">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-semibold text-foreground">No documents found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || selectedType !== "all"
                  ? "No files match your current search criteria or filter."
                  : "You haven't uploaded any knowledge documents yet. Upload files to get started!"}
              </p>
            </div>
            <UploadDialog onUploadSuccess={onRefresh}>
              <Button className="mt-2 rounded-xl">
                <Upload className="mr-2 h-4 w-4" /> Upload Document
              </Button>
            </UploadDialog>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredDocs.map((doc) => (
              <motion.div
                key={doc.document_id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -3 }}
                className="group"
              >
                <Card className="glass-card overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg">
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-foreground text-sm truncate max-w-[180px]" title={doc.filename}>
                            {doc.filename}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <Badge variant="outline" className={`text-[10px] ${getFileBadgeColor(doc.file_type)}`}>
                              {doc.file_type.split("/").pop() || "Document"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingId(doc.document_id)
                          setDeletingName(doc.filename)
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Domain Category Badge */}
                    <div>
                      {getCategoryBadge(doc.category)}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 py-2 px-3 bg-muted/40 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Layers className="h-3.5 w-3.5 text-blue-500" />
                        <span><strong className="text-foreground">{doc.chunk_count}</strong> chunks</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInspectDoc(doc)}
                        className="flex-1 text-xs rounded-xl h-8 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> Inspect
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onAskDocument(doc.filename)}
                        className="flex-1 text-xs rounded-xl h-8 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1" /> Ask AI
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Table View */
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/60 text-muted-foreground border-b border-border/60">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Document Name</th>
                  <th className="px-6 py-3.5 font-semibold">Domain Category</th>
                  <th className="px-6 py-3.5 font-semibold">Vector Chunks</th>
                  <th className="px-6 py-3.5 font-semibold">Date Uploaded</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredDocs.map((doc) => (
                  <tr key={doc.document_id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate max-w-xs">{doc.filename}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getCategoryBadge(doc.category)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground">{doc.chunk_count}</span> vectors
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {new Date(doc.uploaded_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInspectDoc(doc)}
                          className="h-8 px-2.5 text-xs rounded-lg"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> Inspect
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAskDocument(doc.filename)}
                          className="h-8 px-2.5 text-xs rounded-lg text-primary hover:bg-primary/10"
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1" /> Ask AI
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(doc.document_id)
                            setDeletingName(doc.filename)
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete confirmation modal */}
      <Dialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <DialogContent className="glass-card sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <DialogTitle>Confirm Document Deletion</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to remove <strong className="text-foreground">{deletingName}</strong>?
              This will erase all its vector embeddings from the FAISS database index.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button variant="outline" onClick={() => setDeletingId(null)} disabled={isDeleting} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting} className="rounded-xl">
              {isDeleting ? "Deleting..." : "Delete Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspect Document Modal */}
      <Dialog open={inspectDoc !== null} onOpenChange={() => setInspectDoc(null)}>
        {inspectDoc && (
          <DialogContent className="glass-card sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold">{inspectDoc.filename}</DialogTitle>
                  <DialogDescription className="text-xs">Document Metadata & Domain Strategy</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 my-2 text-sm">
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="text-xs text-muted-foreground">Document ID</p>
                  <p className="font-semibold text-foreground">#{inspectDoc.document_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-semibold text-primary">{inspectDoc.category || "General"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Chunks</p>
                  <p className="font-semibold text-foreground">{inspectDoc.chunk_count} FAISS Vectors</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Uploaded Date</p>
                  <p className="font-semibold text-foreground">{new Date(inspectDoc.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>

              {inspectDoc.processing_strategy && (
                <div className="space-y-1.5 p-3.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Processing Strategy
                  </p>
                  <p className="text-xs text-muted-foreground">{inspectDoc.processing_strategy}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Vector Store Status</p>
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-medium border border-emerald-500/20">
                  <FileCheck className="h-4 w-4" />
                  Indexed and ready for Agentic RAG querying.
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  const filename = inspectDoc.filename
                  setInspectDoc(null)
                  onAskDocument(filename)
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl"
              >
                <MessageSquare className="h-4 w-4 mr-2" /> Query with AI Copilot
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
