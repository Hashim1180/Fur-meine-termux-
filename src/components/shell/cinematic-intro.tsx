"use client"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSite } from "@/lib/store"

/**
 * Cinematic intro — full-bleed facility-dark.mp4 with the manifesto
 * "THERE IS NO SHORTCUT" letter-spliced in, and a border-drawing SKIP INTRO button.
 * Auto-advances after ~6.5s or on skip. → phase: "site"
 */
export default function CinematicIntro() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [closing, setClosing] = useState(false)
  const setPhase = useSite((s) => s.setPhase)
  const phase = useSite((s) => s.phase)

  const advance = () => {
    setClosing(true)
    setTimeout(() => setPhase("site"), 650)
  }

  useEffect(() => {
    if (phase !== "intro") return
    const v = videoRef.current
    if (v) {
      v.play().catch(() => {})
      v.playbackRate = 0.85
    }
    const auto = setTimeout(() => advance(), 6500)
    return () => clearTimeout(auto)
  }, [phase])

  if (phase !== "intro" && !closing) return null

  return (
    <AnimatePresence>
      {!closing ? (
        <motion.div
          className="fixed inset-0 z-[99] overflow-hidden bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.65, ease: [0.7, 0, 0.3, 1] }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover opacity-70"
            src="/media/videos/facility-dark.mp4"
            muted
            playsInline
            loop
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 scanlines opacity-30" />

          {/* Manifesto text — letter spliced */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            <motion.div
              className="font-mono text-[10px] tracking-mega text-[var(--neon)]/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              AW GYMS // MANIFESTO
            </motion.div>
            <h1 className="mt-6 flex flex-wrap justify-center gap-x-3 gap-y-1 font-display text-5xl font-black leading-[0.9] tracking-cinema text-white sm:text-7xl md:text-8xl">
              {"THERE IS".split("").map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
                  className="inline-block"
                >
                  {ch}
                </motion.span>
              ))}
              <span className="block w-full" />
              {"NO SHORTCUT".split("").map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{ delay: 1.1 + i * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
                  className={ch === " " ? "inline-block w-3" : "inline-block text-gradient-neon"}
                >
                  {ch === " " ? "" : ch}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="mt-8 max-w-md font-mono text-[11px] leading-relaxed tracking-wide-2 text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
            >
              Discipline is the only leverage. We engineer the architecture of strength —
              authentic supplements, commercial-grade iron, and a 24/7 neural concierge.
            </motion.p>
          </div>

          {/* Border-drawing SKIP INTRO button */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={advance}
              className="group relative inline-flex items-center gap-3 px-6 py-3"
            >
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect
                  x="1" y="1" width="98" height="98"
                  fill="none"
                  stroke="var(--neon)"
                  strokeWidth="1"
                  strokeDasharray="400"
                  strokeDashoffset="400"
                  className="animate-border-draw"
                />
              </svg>
              <span className="font-mono text-[10px] tracking-mega text-white/80 group-hover:text-[var(--neon)] transition-colors">
                SKIP INTRO
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon)] animate-pulse-neon" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
