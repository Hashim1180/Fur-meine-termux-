"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, VolumeX, Sparkles, ChevronDown, Settings2 } from "lucide-react"
import { useSite, useAdmin } from "@/lib/store"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "Manifesto", href: "#manifesto" },
  { label: "Showroom", href: "#showroom" },
  { label: "Catalog", href: "#catalog" },
  { label: "Events", href: "#events" },
]

export default function Header() {
  const phase = useSite((s) => s.phase)
  const soundOn = useSite((s) => s.soundOn)
  const toggleSound = useSite((s) => s.toggleSound)
  const sensory = useSite((s) => s.sensory)
  const setSensory = useSite((s) => s.setSensory)
  const currency = useSite((s) => s.currency)
  const setCurrency = useSite((s) => s.setCurrency)
  const brand = useSite((s) => s.brand)
  const setCmdOpen = useAdmin((s) => s.setCmdOpen)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (phase !== "site") return null

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled ? "glass-strong" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3 sm:px-8">
        {/* brand */}
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute inset-0 rounded-sm border border-[var(--neon)]/60 transition-transform duration-500 group-hover:rotate-90" />
            <span className="font-display text-sm font-black text-[var(--neon)]">A</span>
          </span>
          <span className="font-display text-lg font-black tracking-cinema text-white">
            {brand.split(" ")[0]} <span className="text-white/40">{brand.split(" ")[1]}</span>
          </span>
        </a>

        {/* nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="group relative font-mono text-[11px] tracking-wide-2 text-white/60 transition-colors hover:text-white"
            >
              {n.label.toUpperCase()}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--neon)] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* currency */}
          <div className="hidden items-center rounded-full border border-white/10 bg-white/5 p-0.5 sm:flex">
            {(["PKR", "USD", "AED"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  "rounded-full px-2.5 py-1 font-mono text-[10px] tracking-wide-2 transition-all",
                  currency === c ? "bg-[var(--neon)] text-[var(--obsidian)]" : "text-white/60 hover:text-white"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* sensory switch */}
          <button
            onClick={() => setSensory(!sensory)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full border px-2.5 transition-all",
              sensory ? "border-[var(--neon)]/50 bg-[var(--neon)]/10" : "border-white/10 bg-white/5"
            )}
            title="Sensory mode"
          >
            <Sparkles className={cn("h-3.5 w-3.5", sensory ? "text-[var(--neon)]" : "text-white/40")} />
            <span className="hidden font-mono text-[10px] tracking-wide-2 text-white/70 sm:inline">
              {sensory ? "FULL" : "LITE"}
            </span>
          </button>

          {/* sound toggle */}
          <button
            onClick={toggleSound}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-[var(--neon)]/50"
            title={soundOn ? "Mute soundscape" : "Unmute soundscape"}
          >
            <AnimatePresence mode="wait">
              {soundOn ? (
                <motion.span key="on" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                  <Volume2 className="h-4 w-4 text-[var(--neon)]" />
                </motion.span>
              ) : (
                <motion.span key="off" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                  <VolumeX className="h-4 w-4 text-white/60" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* admin trigger (hidden gear → opens Cmd+K) */}
          <button
            onClick={() => setCmdOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-[var(--neon)]/50"
            title="Command Center (⌘K)"
          >
            <Settings2 className="h-4 w-4 text-white/60" />
          </button>
        </div>
      </div>
    </motion.header>
  )
}
