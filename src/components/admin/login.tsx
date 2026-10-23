"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { api } from "@/lib/api-client"
import { useAdmin } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * Command Center login gate.
 * Single password field. On submit → POST /api/admin/login → httpOnly cookie.
 */
export default function Login() {
  const setAuthed = useAdmin((s) => s.setAuthed)
  const setOpen = useAdmin((s) => s.setOpen)
  const { toast } = useToast()
  const [pw, setPw] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    if (busy) return
    setBusy(true)
    setErr(null)
    try {
      await api.admin.login(pw)
      setAuthed(true)
      toast({ title: "ACCESS GRANTED", description: "Welcome back, operator." })
    } catch {
      setErr("Access denied.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      className="relative flex min-h-screen items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {/* close button */}
      <button
        onClick={() => setOpen(false)}
        aria-label="Close admin"
        className="absolute right-5 top-5 z-10 inline-flex size-9 items-center justify-center rounded-md border border-white/10 text-white/60 transition-colors hover:bg-white/5 hover:text-white"
      >
        <X className="size-4" />
      </button>

      <motion.div
        initial={{ y: 18, opacity: 0, filter: "blur(8px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: 0.05 }}
        className="glass-strong box-glow-neon w-full max-w-md rounded-2xl p-8 sm:p-10"
      >
        <div className="text-center">
          <div className="font-mono text-[10px] tracking-mega text-[var(--neon)]/80">
            AW GYMS // SECURE
          </div>
          <h1 className="mt-3 font-sans text-5xl font-black tracking-cinema text-white sm:text-6xl">
            AW <span className="text-gradient-neon">GYMS</span>
          </h1>
          <div className="mt-2 font-mono text-[10px] tracking-mega text-white/50">
            COMMAND CENTER
          </div>
        </div>

        <div className="hr-neon my-7 w-full" />

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <label className="block">
            <span className="font-mono text-[10px] tracking-mega text-white/50">
              PASSPHRASE
            </span>
            <Input
              type="password"
              autoFocus
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••••"
              className="mt-2 h-12 font-mono text-base tracking-widest"
              autoComplete="current-password"
            />
          </label>

          {err && (
            <div className="font-mono text-[11px] tracking-wide-2 text-[var(--crimson)]">
              {err}
            </div>
          )}

          <Button
            type="submit"
            disabled={busy || !pw}
            className="h-12 w-full bg-[var(--neon)] text-[var(--obsidian)] font-mono text-xs tracking-mega hover:bg-[var(--neon)]/90 disabled:opacity-40"
          >
            {busy ? "AUTHENTICATING…" : "AUTHENTICATE"}
          </Button>
        </form>

        <p className="mt-6 text-center font-mono text-[10px] tracking-wide-2 text-white/35">
          Demo password: <span className="text-[var(--neon)]/80">awgyms2026</span>
        </p>
      </motion.div>

      {/* corner brackets */}
      <div className="pointer-events-none absolute inset-6 hidden sm:block">
        <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-[var(--neon)]/40" />
        <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-[var(--neon)]/40" />
        <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-[var(--neon)]/40" />
        <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-[var(--neon)]/40" />
      </div>
    </motion.div>
  )
}
