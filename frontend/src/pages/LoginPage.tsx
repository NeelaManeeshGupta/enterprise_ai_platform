import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import api from "@/services/api"

export interface UserProfile {
  user_id: string
  username: string
  email: string
}

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile, token: string) => void
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || (isSignup && !username)) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      if (isSignup) {
        const res = await api.post("/auth/signup", { username, email, password }, { timeout: 6000 })
        toast.success("Account created successfully!")
        onLoginSuccess(res.data.user, res.data.token)
      } else {
        const res = await api.post("/auth/login", { email, password }, { timeout: 6000 })
        toast.success(`Welcome back, ${res.data.user.username}!`)
        onLoginSuccess(res.data.user, res.data.token)
      }
    } catch (err: any) {
      console.error("Auth error:", err)
      const detail = err.response?.data?.detail
      if (detail) {
        toast.error(detail)
      } else {
        // Fallback for offline backend
        toast.info("Logging in with local demo credentials...")
        const demoUser: UserProfile = {
          user_id: "demo-user-1",
          username: username || email.split("@")[0] || "Enterprise User",
          email: email
        }
        onLoginSuccess(demoUser, "token_demo_123")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    const demoUser: UserProfile = {
      user_id: "demo-user-admin",
      username: "Maneesh Gupta",
      email: "maneesh@enterprise.ai"
    }
    toast.success("Logged in as Maneesh Gupta (Admin)")
    onLoginSuccess(demoUser, "token_admin_999")
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Background ambient lighting blur effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-purple-600/15 blur-[120px] pointer-events-none rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card border border-border/60 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl relative z-10">
          <CardContent className="p-8 space-y-6">
            {/* Logo & Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2 mt-3">
                Enterprise AI Copilot
              </h1>
              <p className="text-xs text-muted-foreground">
                Agentic Knowledge Platform & Multi-Modal Vector Workspace
              </p>

              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-2 py-0.5 mt-2 font-semibold">
                <ShieldCheck className="h-3 w-3 mr-1" /> Enterprise Workspace Security
              </Badge>
            </div>

            {/* Toggle Mode Pills */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-muted/60 rounded-xl border border-border/40">
              <button
                type="button"
                onClick={() => setIsSignup(false)}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  !isSignup ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setIsSignup(true)}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isSignup ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Maneesh Gupta"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 rounded-xl bg-background/50 border-border/60"
                      required={isSignup}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="maneesh@enterprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl bg-background/50 border-border/60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 rounded-xl bg-background/50 border-border/60"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-11 shadow-lg shadow-primary/20 cursor-pointer mt-2"
              >
                {loading ? (
                  "Authenticating..."
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    {isSignup ? "Create Account & Workspace" : "Log In to Workspace"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="pt-2 flex flex-col items-center gap-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDemoLogin}
                className="w-full text-xs rounded-xl border-dashed border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 mr-1" /> Quick Demo Login (Skip Auth)
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
