"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  Save,
  Settings as SettingsIcon,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  DollarSign,
  Box,
  Type,
  Lock,
} from "lucide-react"
import { api } from "@/lib/api-client"
import { useAdmin, useSite } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import type { SettingsDTO } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const EASE = [0.2, 0.8, 0.2, 1] as const

interface AdminSettings extends SettingsDTO {
  adminPassword: string
}

export default function SettingsPanel() {
  const qc = useQueryClient()
  const setAuthed = useAdmin((s) => s.setAuthed)
  const hydrate = useSite((s) => s.hydrateSettings)
  const { toast } = useToast()

  const q = useQuery<AdminSettings>({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const r = (await api.admin.settings()) as { settings: AdminSettings }
      return r.settings
    },
    retry: false,
  })

  useEffect(() => {
    if (q.isError) setAuthed(false)
  }, [q.isError, setAuthed])

  const [form, setForm] = useState<AdminSettings | null>(null)
  const [pwd, setPwd] = useState("")

  // Sync form from server data using the React-recommended "adjust state during render"
  // pattern (setState during render is allowed; React re-renders without committing).
  const [lastSynced, setLastSynced] = useState<AdminSettings | null>(null)
  if (q.data && q.data !== lastSynced) {
    setLastSynced(q.data)
    setForm(q.data)
  }

  const saveMut = useMutation({
    mutationFn: async (payload: Record<string, string>) => api.admin.saveSettings(payload),
    onSuccess: async () => {
      // refetch public settings and hydrate the global store so the live site updates
      try {
        const fresh = await api.settings()
        hydrate({
          whatsapp: fresh.whatsappNumber,
          rates: { usdRate: fresh.usdRate, aedRate: fresh.aedRate },
          announcement: fresh.announcement,
          sketchfab: fresh.sketchfabUrl,
          brand: fresh.brandName,
          tagline: fresh.brandTagline,
        })
      } catch {
        /* non-fatal */
      }
      qc.invalidateQueries({ queryKey: ["admin", "settings"] })
      qc.invalidateQueries({ queryKey: ["admin", "telemetry"] })
      qc.invalidateQueries({ queryKey: ["public", "settings"] })
      toast({ title: "Saved — live now.", description: "Settings pushed to the live site." })
    },
    onError: (e: Error) => {
      if (String(e).includes("401")) setAuthed(false)
      toast({ title: "Save failed", description: e.message, variant: "destructive" })
    },
  })

  const submit = () => {
    if (!form) return
    const payload: Record<string, string> = {
      whatsappNumber: form.whatsappNumber,
      usdRate: String(form.usdRate),
      aedRate: String(form.aedRate),
      announcement: form.announcement,
      sketchfabUrl: form.sketchfabUrl,
      brandName: form.brandName,
      brandTagline: form.brandTagline,
    }
    if (pwd.trim()) payload.adminPassword = pwd.trim()
    saveMut.mutate(payload)
  }

  if (!form) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-[11px] text-white/45">
        Loading settings…
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <div className="font-mono text-[10px] tracking-mega text-[var(--neon)]/80">
            SITE CONFIGURATION
          </div>
          <h1 className="mt-1 font-sans text-3xl font-black tracking-cinema text-white sm:text-4xl">
            SETTINGS <span className="text-gradient-neon">/ LIVE</span>
          </h1>
          <p className="mt-1 font-mono text-[11px] tracking-wide-2 text-white/45">
            Changes push instantly to the live site — no redeploy
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
        className="glass rounded-xl p-5 sm:p-6"
      >
        <SectionHeader
          icon={<MessageSquare className="size-4" />}
          title="Contact"
          hint="whatsapp + announcement bar"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WHATSAPP NUMBER">
            <Input
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              className="h-10 font-mono"
              placeholder="+923497814918"
            />
          </Field>
          <Field label="ANNOUNCEMENT BAR" className="sm:col-span-2">
            <Textarea
              value={form.announcement}
              onChange={(e) => setForm({ ...form, announcement: e.target.value })}
              rows={2}
              placeholder="Free delivery on orders over Rs 25,000 · Ramadan flash sale live now"
            />
          </Field>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="glass rounded-xl p-5 sm:p-6"
      >
        <SectionHeader
          icon={<DollarSign className="size-4" />}
          title="Currency rates"
          hint="PKR base · used by converters + invoice engine"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="USD RATE (PKR)">
            <Input
              type="number"
              step="0.01"
              value={form.usdRate}
              onChange={(e) => setForm({ ...form, usdRate: Number(e.target.value) })}
              className="h-10 font-mono tabular-nums"
            />
          </Field>
          <Field label="AED RATE (PKR)">
            <Input
              type="number"
              step="0.01"
              value={form.aedRate}
              onChange={(e) => setForm({ ...form, aedRate: Number(e.target.value) })}
              className="h-10 font-mono tabular-nums"
            />
          </Field>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
        className="glass rounded-xl p-5 sm:p-6"
      >
        <SectionHeader
          icon={<Box className="size-4" />}
          title="Brand + 3D"
          hint="identity + sketchfab embed"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="BRAND NAME" className="sm:col-span-2">
            <div className="relative">
              <Type className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/40" />
              <Input
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                className="h-10 pl-8"
              />
            </div>
          </Field>
          <Field label="BRAND TAGLINE" className="sm:col-span-2">
            <Input
              value={form.brandTagline}
              onChange={(e) => setForm({ ...form, brandTagline: e.target.value })}
              className="h-10"
              placeholder="THERE IS NO SHORTCUT"
            />
          </Field>
          <Field label="SKETCHFAB EMBED URL" className="sm:col-span-2">
            <Input
              value={form.sketchfabUrl}
              onChange={(e) => setForm({ ...form, sketchfabUrl: e.target.value })}
              className="h-10 font-mono text-xs"
              placeholder="https://sketchfab.com/models/.../embed"
            />
          </Field>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
        className="glass rounded-xl p-5 sm:p-6"
      >
        <SectionHeader
          icon={<Lock className="size-4" />}
          title="Admin passphrase"
          hint="leave blank to keep current"
        />
        <Field label="NEW PASSPHRASE">
          <Input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="h-10 font-mono"
            placeholder="••••••••••"
            autoComplete="new-password"
          />
        </Field>
        <p className="mt-2 font-mono text-[10px] tracking-wide-2 text-white/35">
          Current: <span className="text-white/55">{form.adminPassword ? "•••• set" : "— default (awgyms2026)"}</span>
        </p>
      </motion.div>

      {/* save bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
        className="sticky bottom-4 z-10"
      >
        <div className="glass-strong box-glow-neon flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-mega text-white/55">
            <SettingsIcon className="size-3.5 text-[var(--neon)]" />
            CHANGES APPLY IMMEDIATELY
          </div>
          <Button
            onClick={submit}
            disabled={saveMut.isPending}
            className="gap-2 bg-[var(--neon)] text-[var(--obsidian)] font-mono text-[10px] tracking-mega hover:bg-[var(--neon)]/90 disabled:opacity-40"
          >
            <Save className="size-3.5" /> {saveMut.isPending ? "SAVING…" : "SAVE"}
          </Button>
        </div>
      </motion.div>

      {/* danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
        className="rounded-xl border border-[var(--crimson)]/30 bg-[var(--crimson)]/5 p-5"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-[var(--crimson)]" />
          <div className="font-mono text-[10px] tracking-mega text-[var(--crimson)]">
            DANGER ZONE
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-white">Reset to seed</div>
            <div className="font-mono text-[11px] text-white/45">
              Re-runs <code className="text-[var(--crimson)]/80">bun run db:seed</code> on the server.
              Restores demo products/events and clears media entries.
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Re-run db:seed on server to reset.",
                description: "No data was changed from this panel.",
              })
            }
            className="gap-2 border-[var(--crimson)]/40 bg-transparent font-mono text-[10px] tracking-mega text-[var(--crimson)] hover:bg-[var(--crimson)]/10"
          >
            <RefreshCw className="size-3.5" /> RESET TO SEED
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode
  title: string
  hint: string
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[var(--neon)]">
          {icon}
        </div>
        <div>
          <h2 className="font-sans text-lg font-bold tracking-cinema text-white">{title}</h2>
          <div className="font-mono text-[10px] tracking-wide-2 text-white/40">{hint}</div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 font-mono text-[10px] tracking-mega text-white/45">{label}</Label>
      {children}
    </div>
  )
}
