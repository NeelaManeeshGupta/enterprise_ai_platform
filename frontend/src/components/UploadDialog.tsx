import { useState, useRef } from "react"
import { Upload, File, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, X } from "lucide-react"
import confetti from "canvas-confetti"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import api from "@/services/api"

interface UploadDialogProps {
  onUploadSuccess?: () => void
  children?: React.ReactNode
}

export default function UploadDialog({ onUploadSuccess, children }: UploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      })
    } catch {
      // fallback if confetti fails
    }
  }

  async function uploadFile() {
    if (!file) {
      toast.error("Please select a document to index")
      return
    }

    try {
      setLoading(true)
      setProgress(15)
      setStatusText("Extracting document contents...")

      const formData = new FormData()
      formData.append("file", file)

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval)
            return 85
          }
          return prev + 15
        })
      }, 300)

      setStatusText("Chunking text & generating vector embeddings...")
      
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })

      clearInterval(progressInterval)

      if (response.data.message === "File type not allowed") {
        toast.error("File type not supported. Use PDF, DOCX, XLSX, CSV, PPTX, PNG, JPEG.")
        setLoading(false)
        setProgress(0)
        setStatusText("")
        return
      }

      setProgress(100)
      setStatusText("Indexed successfully!")

      fireConfetti()
      toast.success(`Successfully indexed ${file.name}!`, {
        description: `Created ${response.data.total_chunks || response.data['total chunks'] || 'multiple'} knowledge vectors.`
      })

      // Instantly trigger document list refresh
      if (onUploadSuccess) {
        onUploadSuccess()
      }

      setTimeout(() => {
        setOpen(false)
        setFile(null)
        setProgress(0)
        setStatusText("")
      }, 600)

    } catch (error: any) {
      console.error("Upload error:", error)
      const detailMsg = error.response?.data?.detail || error.response?.data?.message || error.message || "Document indexing failed"
      toast.error(`Indexing failed: ${detailMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="lg" className="bg-white hover:bg-slate-100 text-slate-900 dark:bg-primary dark:hover:bg-primary/90 dark:text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg glass-card border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 animate-pulse text-blue-500" />
            <DialogTitle className="text-xl font-bold">Upload Knowledge Document</DialogTitle>
          </div>
          <DialogDescription>
            Add PDF, Word, Excel, CSV, or Image documents to expand your AI vector store.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : file
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-slate-300 dark:border-slate-700 hover:border-primary/60 hover:bg-slate-50 dark:hover:bg-slate-900/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.docx,.xlsx,.pptx,.csv,.png,.jpg,.jpeg"
            />

            {file ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground text-sm max-w-[280px] truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive mt-1"
                >
                  <X className="h-3.5 w-3.5 mr-1" /> Change file
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-4 bg-primary/10 text-primary rounded-full">
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Drag and drop your file here, or <span className="text-primary hover:underline">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PDF, DOCX, XLSX, CSV, PPTX, PNG, JPG (up to 50MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Supported tags */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            <Badge variant="outline" className="text-[11px] font-normal">PDF</Badge>
            <Badge variant="outline" className="text-[11px] font-normal">DOCX</Badge>
            <Badge variant="outline" className="text-[11px] font-normal">XLSX</Badge>
            <Badge variant="outline" className="text-[11px] font-normal">CSV</Badge>
            <Badge variant="outline" className="text-[11px] font-normal">PPTX</Badge>
            <Badge variant="outline" className="text-[11px] font-normal">Images</Badge>
          </div>

          {/* Uploading progress indicator */}
          {loading && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-primary flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {statusText}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 rounded-full" />
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={uploadFile}
            disabled={!file || loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-md cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Start Indexing
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}