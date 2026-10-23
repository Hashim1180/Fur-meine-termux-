"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Command as CommandPrimitive } from "cmdk"
import {
  BarChart3,
  Package,
  CalendarDays,
  Image as ImageIcon,
  Settings,
  Command as CommandIcon,
  X,
  LogOut,
  Plus,
  Upload,
  DollarSign,
} from "lucide-react"
import { useAdmin } from "@/lib/store"
import { Button } from "@/components/ui/button"
import Login from "./login"
import Telemetry from "./telemetry"
import ProductsPanel from "./products-panel"
import EventsPanel from "./events-panel"
import MediaPanel from "./media-panel"
import SettingsPanel from "./settings-panel"

const EASE = [0.2, 0.8, 0.2, 1] as const

type View = "telemetry" | "products" | "events" | "media" | "settings"

const NAV: { id: View; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: "telemetry", label: "Telemetry", icon: <BarChart3 className="size-4" />, hint: "Dashboard" },
  { id: "products", label: "Products", icon: <Package className="size-4" />, hint: "Catalog" },
  { id: "events", label: "Events", icon: <CalendarDays className="size-4" />, hint: "Schedule" },
  { id: "media", label: "Media", icon: <ImageIcon className="size-4" />, hint: "Library" },
  { id: "settings", label: "Settings", icon: <Settings className="size-4" />, hint: "Live config" },
]

export default function CommandCenter() {
  const { open, cmdOpen, authed, view, setOpen, setCmdOpen, setAuthed, setView } = useAdmin()

  // global keyboard shortcuts: Cmd/Ctrl+K toggle palette, Esc closes palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (!authed) {
          // not authed → just open the overlay so the login screen shows
          setOpen(true)
        } else {
          setCmdOpen(!cmdOpen)
          setOpen(true)
        }
      } else if (e.key === "Escape") {
        if (cmdOpen) setCmdOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [authed, cmdOpen, open, setCmdOpen, setOpen])

  const visible = open || cmdOpen

  return (
    <>
      {/* discoverability hint — only when overlay is closed */}
      {!visible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--obsidian)] px-6">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="font-mono text-[10px] tracking-mega text-[var(--neon)]/80"
            >
              AW GYMS 2.0 // OPERATOR CONSOLE
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="mt-3 font-sans text-5xl font-black tracking-cinema text-white sm:text-7xl"
            >
              AW <span className="text-gradient-neon">GYMS</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
              className="mx-auto mt-4 max-w-sm font-mono text-[11px] leading-relaxed tracking-wide-2 text-white/40"
            >
              The command center is hidden. Press the keybind to authenticate and operate.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
              className="mt-8 flex items-center justify-center gap-3"
            >
              <button
                onClick={() => setOpen(true)}
                className="group inline-flex items-center gap-3 rounded-lg border border-[var(--neon)]/40 bg-[var(--neon)]/5 px-5 py-3 transition-all hover:bg-[var(--neon)]/10 hover:box-glow-neon"
              >
                <CommandIcon className="size-4 text-[var(--neon)]" />
                <span className="font-mono text-[10px] tracking-mega text-white/80 group-hover:text-[var(--neon)]">
                  PRESS ⌘K / CTRL+K
                </span>
                <span className="size-1.5 animate-pulse rounded-full bg-[var(--neon)]" />
              </button>
            </motion.div>
            <div className="mt-6 font-mono text-[10px] tracking-wide-2 text-white/25">
              Demo passphrase: <span className="text-[var(--neon)]/70">awgyms2026</span>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {visible && (
          <motion.div
            className="fixed inset-0 z-[80] bg-[var(--obsidian)]/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
          {!authed ? (
            <Login />
          ) : (
            <AdminShell
              view={view}
              open={open}
              cmdOpen={cmdOpen}
              setOpen={setOpen}
              setCmdOpen={setCmdOpen}
              setAuthed={setAuthed}
              setView={setView}
            />
          )}

          {/* cmd+k launcher (over the authed shell) */}
          {authed && cmdOpen && (
            <CmdLauncher
              view={view}
              onNavigate={(v) => {
                setView(v)
                setOpen(true)
                setCmdOpen(false)
              }}
              onAction={(a) => {
                if (a === "quick-rate") {
                  setView("products")
                  setOpen(true)
                  setCmdOpen(false)
                } else if (a === "add-event") {
                  setView("events")
                  setOpen(true)
                  setCmdOpen(false)
                } else if (a === "bulk-sync") {
                  setView("products")
                  setOpen(true)
                  setCmdOpen(false)
                  // nudge: a small delay then dispatch a custom event the panel listens for
                  setTimeout(() => window.dispatchEvent(new CustomEvent("aw:open-bulk")), 120)
                } else if (a === "logout") {
                  setAuthed(false)
                  setOpen(false)
                  setCmdOpen(false)
                  // best-effort logout call (cookie)
                  fetch("/api/admin/logout", { method: "POST" }).catch(() => {})
                }
              }}
              onClose={() => setCmdOpen(false)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}

function AdminShell({
  view,
  open,
  cmdOpen,
  setOpen,
  setCmdOpen,
  setAuthed,
  setView,
}: {
  view: View
  open: boolean
  cmdOpen: boolean
  setOpen: (v: boolean) => void
  setCmdOpen: (v: boolean) => void
  setAuthed: (v: boolean) => void
  setView: (v: View) => void
}) {
  const current = NAV.find((n) => n.id === view) ?? NAV[0]

  const handleLogout = () => {
    setAuthed(false)
    setOpen(false)
    fetch("/api/admin/logout", { method: "POST" }).catch(() => {})
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="flex h-full flex-col"
    >
      {/* top bar */}
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md border border-[var(--neon)]/40 bg-[var(--neon)]/10 text-[var(--neon)]">
            <CommandIcon className="size-4" />
          </div>
          <div>
            <div className="font-sans text-sm font-bold tracking-cinema text-white">
              AW GYMS <span className="text-[var(--neon)]/80">{"//"} COMMAND</span>
            </div>
            <div className="font-mono text-[9px] tracking-mega text-white/40">
              OPERATOR CONSOLE
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* current view title — desktop */}
          <div className="hidden items-center gap-2 sm:flex">
            <span className="font-mono text-[10px] tracking-mega text-white/30">VIEW</span>
            <span className="font-mono text-[11px] tracking-wide-2 text-[var(--neon)]">
              {current.label.toUpperCase()}
            </span>
          </div>
          <Button
            onClick={() => setCmdOpen(!cmdOpen)}
            variant="outline"
            className="gap-2 border-white/10 bg-white/[0.03] px-2.5 font-mono text-[10px] tracking-mega text-white/65 hover:text-[var(--neon)]"
          >
            <CommandIcon className="size-3.5" />
            <span className="hidden sm:inline">⌘K</span>
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="gap-2 font-mono text-[10px] tracking-mega text-white/55 hover:text-[var(--crimson)]"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">LOGOUT</span>
          </Button>
          <Button
            onClick={() => setOpen(false)}
            variant="ghost"
            size="icon"
            className="size-9 text-white/55 hover:text-white"
            aria-label="Close admin"
          >
            <X className="size-4" />
          </Button>
        </div>
      </header>

      {/* mobile tabs */}
      <div className="border-b border-white/10 px-3 py-2 lg:hidden">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[10px] tracking-mega transition-colors ${
                view === n.id
                  ? "bg-[var(--neon)] text-[var(--obsidian)]"
                  : "text-white/55 hover:text-white"
              }`}
            >
              {n.icon}
              {n.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* sidebar (desktop) */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 p-3 lg:flex">
          <div className="px-2 py-2 font-mono text-[9px] tracking-mega text-white/30">
            NAVIGATION
          </div>
          <nav className="space-y-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setView(n.id)}
                className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                  view === n.id
                    ? "bg-[var(--neon)]/10 text-[var(--neon)]"
                    : "text-white/60 hover:bg-white/[0.03] hover:text-white"
                }`}
              >
                <span
                  className={`flex size-7 items-center justify-center rounded-md border ${
                    view === n.id
                      ? "border-[var(--neon)]/40 bg-[var(--neon)]/10"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  {n.icon}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{n.label}</span>
                  <span className="block font-mono text-[9px] tracking-wide-2 text-white/35">
                    {n.hint.toUpperCase()}
                  </span>
                </span>
                {view === n.id && <span className="size-1.5 rounded-full bg-[var(--neon)]" />}
              </button>
            ))}
          </nav>
          <div className="mt-auto px-2 pt-4">
            <div className="hr-neon mb-3 w-full" />
            <div className="font-mono text-[9px] leading-relaxed tracking-wide-2 text-white/30">
              {new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </div>
            <div className="mt-1 font-mono text-[9px] tracking-wide-2 text-white/30">
              AW GYMS 2.0 · v8
            </div>
          </div>
        </aside>

        {/* main */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {view === "telemetry" && <Telemetry />}
          {view === "products" && <ProductsPanel />}
          {view === "events" && <EventsPanel />}
          {view === "media" && <MediaPanel />}
          {view === "settings" && <SettingsPanel />}
        </main>
      </div>
    </motion.div>
  )
}

function CmdLauncher({
  view,
  onNavigate,
  onAction,
  onClose,
}: {
  view: View
  onNavigate: (v: View) => void
  onAction: (a: "quick-rate" | "add-event" | "bulk-sync" | "logout") => void
  onClose: () => void
}) {
  return (
    <motion.div
      className="absolute inset-0 z-[90] flex items-start justify-center bg-black/40 pt-[14vh] px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -10, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: -10, scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong box-glow-neon w-full max-w-[560px] overflow-hidden rounded-2xl"
      >
        <CommandPrimitive
          className="flex flex-col"
          loop
        >
          <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-3">
            <CommandIcon className="size-4 text-[var(--neon)]" />
            <CommandPrimitive.Input
              autoFocus
              placeholder="Type a command or search…"
              className="flex-1 bg-transparent font-mono text-sm text-white placeholder:text-white/35 outline-none"
            />
            <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-white/45">
              ESC
            </kbd>
          </div>

          <CommandPrimitive.List className="max-h-[60vh] overflow-y-auto p-2">
            <CommandPrimitive.Empty className="px-3 py-8 text-center font-mono text-[11px] text-white/35">
              No matching command.
            </CommandPrimitive.Empty>

            <CommandPrimitive.Group
              heading="Navigate"
              className="text-white [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:tracking-mega [&_[cmdk-group-heading]]:text-white/40"
            >
              {NAV.map((n) => (
                <CmdItem
                  key={n.id}
                  icon={n.icon}
                  label={n.label}
                  hint={n.hint}
                  active={view === n.id}
                  onSelect={() => onNavigate(n.id)}
                />
              ))}
            </CommandPrimitive.Group>

            <CommandPrimitive.Group
              heading="Actions"
              className="text-white [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:tracking-mega [&_[cmdk-group-heading]]:text-white/40"
            >
              <CmdItem
                icon={<DollarSign className="size-4" />}
                label="Quick rate update"
                hint="Edit prices inline"
                onSelect={() => onAction("quick-rate")}
              />
              <CmdItem
                icon={<Plus className="size-4" />}
                label="Add event"
                hint="Schedule new program"
                onSelect={() => onAction("add-event")}
              />
              <CmdItem
                icon={<Upload className="size-4" />}
                label="Bulk sync products"
                hint="Paste CSV"
                onSelect={() => onAction("bulk-sync")}
              />
              <CmdItem
                icon={<LogOut className="size-4" />}
                label="Logout"
                hint="End session"
                onSelect={() => onAction("logout")}
                danger
              />
            </CommandPrimitive.Group>
          </CommandPrimitive.List>
        </CommandPrimitive>
      </motion.div>
    </motion.div>
  )
}

function CmdItem({
  icon,
  label,
  hint,
  active,
  danger,
  onSelect,
}: {
  icon: React.ReactNode
  label: string
  hint: string
  active?: boolean
  danger?: boolean
  onSelect: () => void
}) {
  return (
    <CommandPrimitive.Item
      onSelect={onSelect}
      className={`group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors data-[selected=true]:bg-white/[0.06] data-[selected=true]:text-white ${
        danger ? "text-white/65 data-[selected=true]:text-[var(--crimson)]" : "text-white/75"
      }`}
    >
      <span
        className={`flex size-7 items-center justify-center rounded-md border ${
          danger
            ? "border-[var(--crimson)]/40 bg-[var(--crimson)]/10 text-[var(--crimson)]"
            : active
              ? "border-[var(--neon)]/40 bg-[var(--neon)]/10 text-[var(--neon)]"
              : "border-white/10 bg-white/[0.03] text-white/55"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <span className="font-mono text-[10px] tracking-wide-2 text-white/40">{hint.toUpperCase()}</span>
    </CommandPrimitive.Item>
  )
}
