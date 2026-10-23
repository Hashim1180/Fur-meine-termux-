"use client"
import { motion } from "framer-motion"
import { useState } from "react"
import { Maximize2, Move3d } from "lucide-react"
import { useSite } from "@/lib/store"
import { cn } from "@/lib/utils"

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const ROOMS = [
  { id: "vestibule", name: "Vestibule", meta: "Reception · Light Lock" },
  { id: "strength", name: "Strength Floor", meta: "Platforms · Racks · Plates" },
  { id: "recovery", name: "Recovery Bay", meta: "Cold · Mobility · Sauna" },
]

export default function Showroom() {
  const sketchfab = useSite((s) => s.sketchfab)
  const [active, setActive] = useState("vestibule")

  return (
    <section
      id="showroom"
      className="relative mx-auto max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 md:py-36"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="font-mono text-[10px] tracking-mega text-[var(--neon)]/80">
            03 — SHOWROOM
          </div>
          <h2 className="mt-3 font-display text-3xl font-black tracking-cinema text-white sm:text-4xl md:text-5xl">
            STEP INSIDE THE FACILITY
          </h2>
        </div>
        <p className="max-w-md font-mono text-[10px] leading-relaxed tracking-wide-2 text-white/40 sm:text-right">
          A FULLY ORBITABLE 3D MODEL OF THE FLAGSHIP. DRAG, ZOOM, AND WALK THE FLOOR
          BEFORE YOU EVER SET FOOT IN LAHORE.
        </p>
      </motion.div>

      {/* 3D viewport */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative overflow-hidden rounded-2xl glass-strong"
      >
        <div className="relative aspect-[4/5] w-full sm:aspect-[16/10] md:aspect-[16/9]">
          <iframe
            src={sketchfab}
            allow="autoplay; fullscreen; xr-spatial-tracking; execution-while-out-of-viewport; execution-while-not-rendered; web-share"
            allowFullScreen
            // legacy fullscreen props
            {...({
              mozallowfullscreen: "true",
              webkitallowfullscreen: "true",
            } as any)}
            frameBorder="0"
            title="AW GYMS — flagship 3D walkthrough"
            className="h-full w-full"
            loading="lazy"
          />

          {/* Pulsing "drag" hint, centered */}
          <div
            data-cursor="drag"
            className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3"
          >
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-[var(--neon)] animate-pulse-neon" />
              <span className="absolute inset-2 rounded-full border border-[var(--neon)]/40" />
              <Move3d className="h-5 w-5 text-[var(--neon)]" />
            </div>
            <span className="font-mono text-[9px] tracking-mega text-white/60">
              DRAG TO ROTATE
            </span>
          </div>

          {/* Top-left status pill */}
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon)] animate-pulse-neon" />
            <span className="font-mono text-[9px] tracking-mega text-white/70">
              LIVE · KHI ORBIT
            </span>
          </div>

          {/* Bottom-right expand hint */}
          <div className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 backdrop-blur">
            <Maximize2 className="h-3 w-3 text-white/60" />
            <span className="font-mono text-[9px] tracking-wide-2 text-white/60">
              FULLSCREEN
            </span>
          </div>
        </div>
      </motion.div>

      {/* Room selector (visual only — single embed) */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {ROOMS.map((r, i) => {
          const isActive = active === r.id
          return (
            <motion.button
              key={r.id}
              type="button"
              onClick={() => setActive(r.id)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
              data-cursor="link"
              className={cn(
                "group relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all duration-300",
                isActive
                  ? "border-[var(--neon)]/60 bg-[var(--neon)]/5 box-glow-neon"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-mega text-white/40">
                  0{i + 1} / 03
                </span>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    isActive ? "bg-[var(--neon)]" : "bg-white/20"
                  )}
                />
              </div>
              <div className="font-display text-lg font-bold tracking-cinema text-white">
                {r.name}
              </div>
              <div className="font-mono text-[9px] tracking-wide-2 text-white/40">
                {r.meta}
              </div>
              {isActive && (
                <motion.span
                  layoutId="room-active-bar"
                  className="absolute left-0 top-0 h-full w-0.5 bg-[var(--neon)]"
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
