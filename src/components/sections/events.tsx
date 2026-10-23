"use client"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MapPin, ArrowUpRight, Lock } from "lucide-react"
import { api } from "@/lib/api-client"
import { useSite } from "@/lib/store"
import { timeRemaining } from "@/lib/format"
import type { EventDTO } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const ACCENT_VAR: Record<EventDTO["accent"], string> = {
  neon: "var(--neon)",
  crimson: "var(--crimson)",
  gold: "var(--gold)",
}

const ACCENT_GLOW: Record<EventDTO["accent"], string> = {
  neon: "0 0 24px oklch(0.86 0.21 130 / 50%)",
  crimson: "0 0 24px oklch(0.62 0.22 18 / 50%)",
  gold: "0 0 24px oklch(0.82 0.16 80 / 50%)",
}

/** Tick every second so countdowns update live. */
function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export default function Events() {
  const { data: events } = useQuery({ queryKey: ["events"], queryFn: api.events })
  const whatsapp = useSite((s) => s.whatsapp)
  const now = useNow()

  const list = useMemo(() => {
    return (events ?? []).map((e) => {
      const total = new Date(e.endDate).getTime() - new Date(e.startDate).getTime()
      const remaining = new Date(e.endDate).getTime() - now
      return {
        ...e,
        totalMs: total,
        msRemaining: remaining,
      }
    })
  }, [events, now])

  return (
    <section
      id="events"
      className="relative mx-auto max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 md:py-36"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="font-mono text-[10px] tracking-mega text-[var(--neon)]/80">
            05 — EVENTS
          </div>
          <h2 className="mt-3 font-display text-3xl font-black tracking-cinema text-white sm:text-4xl md:text-5xl">
            15-DAY COURSE CYCLES
          </h2>
        </div>
        <p className="max-w-md font-mono text-[10px] leading-relaxed tracking-wide-2 text-white/40 sm:text-right">
          THREE CONCURRENT TRAINING BLOCKS. EACH CYCLE AUTO-ARCHIVES WHEN ITS
          COUNTDOWN HITS ZERO. ENROLLMENT IS HUMAN-VERIFIED.
        </p>
      </motion.div>

      <div className="flex flex-col gap-4">
        {list.map((e, i) => {
          const accentVar = ACCENT_VAR[e.accent]
          const accentGlow = ACCENT_GLOW[e.accent]
          const t = timeRemaining(Math.max(0, e.msRemaining))
          const isArchived = e.archived || t.done
          const pct =
            e.totalMs > 0
              ? Math.min(
                  100,
                  Math.max(0, 100 - (e.msRemaining / e.totalMs) * 100)
                )
              : 0

          const wa = `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
            `AW GYMS — Enroll me in "${e.title}" (${e.subtitle}). Starts ${new Date(
              e.startDate
            ).toDateString()}. Capacity ${e.capacity}, ${e.enrolled} seats taken.`
          )}`

          return (
            <motion.article
              key={e.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
              className={cn(
                "relative flex flex-col gap-6 overflow-hidden rounded-2xl glass p-5 pl-7 sm:p-6 sm:pl-8 md:flex-row md:gap-8",
                isArchived && "opacity-60"
              )}
            >
              {/* Left accent bar */}
              <div
                className="absolute left-0 top-0 h-full w-1"
                style={{ background: accentVar, boxShadow: accentGlow }}
              />

              {/* LEFT — countdown / archived */}
              <div className="md:w-64 md:shrink-0">
                <div className="font-mono text-[9px] tracking-mega text-white/40">
                  COUNTDOWN
                </div>
                {isArchived ? (
                  <div className="mt-3 flex flex-col gap-3">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded border border-[var(--crimson)]/40 bg-[var(--crimson)]/10 px-2.5 py-1 font-mono text-[10px] tracking-mega text-[var(--crimson)]">
                      <Lock className="h-3 w-3" />
                      ARCHIVED
                    </span>
                    <p className="font-mono text-[10px] tracking-wide-2 text-white/40">
                      CYCLE CLOSED · NEXT INTAKE TBA
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {[
                      { v: t.d, l: "DAYS" },
                      { v: t.h, l: "HRS" },
                      { v: t.m, l: "MIN" },
                      { v: t.s, l: "SEC" },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="flex flex-col items-center rounded-lg border border-white/5 bg-black/30 py-2"
                      >
                        <span className="font-display text-2xl font-black tabular-nums text-white sm:text-3xl">
                          {String(s.v).padStart(2, "0")}
                        </span>
                        <span className="font-mono text-[9px] tracking-mega text-white/40">
                          {s.l}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MIDDLE — content */}
              <div className="flex-1">
                <div
                  className="font-mono text-[10px] tracking-wide-2"
                  style={{ color: accentVar }}
                >
                  {e.subtitle.toUpperCase()}
                </div>
                <h3 className="mt-1.5 font-display text-2xl font-bold tracking-cinema text-white sm:text-3xl">
                  {e.title}
                </h3>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/55">
                  {e.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide-2 text-white/50">
                    <MapPin className="h-3 w-3" style={{ color: accentVar }} />
                    {e.location.toUpperCase()}
                  </div>
                  <span className="h-3 w-px bg-white/10" />
                  <span className="font-mono text-[10px] tracking-wide-2 text-white/50">
                    {e.durationDays}-DAY CYCLE
                  </span>
                </div>
              </div>

              {/* RIGHT — progress + enroll */}
              <div className="md:w-56 md:shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] tracking-mega text-white/40">
                    PROGRESS
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-white/70">
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={pct}
                  className="mt-2 h-1.5"
                  style={
                    {
                      background: "oklch(0.22 0.01 270 / 50%)",
                      "--primary": accentVar,
                    } as React.CSSProperties & Record<string, string>
                  }
                />

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-[9px] tracking-mega text-white/40">
                    SEATS
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-white">
                    {e.enrolled}
                    <span className="text-white/40">/{e.capacity}</span>
                  </span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (e.enrolled / e.capacity) * 100)}%`,
                      background: accentVar,
                    }}
                  />
                </div>

                {isArchived ? (
                  <div className="mt-5 flex h-10 w-full items-center justify-center rounded-full border border-white/10 font-mono text-[11px] tracking-wide-2 text-white/40">
                    WAITLIST ONLY
                  </div>
                ) : (
                  <Button
                    asChild
                    className="mt-5 h-10 w-full rounded-full bg-[var(--neon)] font-mono text-[11px] tracking-wide-2 text-[var(--obsidian)] transition-shadow hover:shadow-[0_0_24px_oklch(0.86_0.21_130_/_40%)]"
                  >
                    <a
                      href={wa}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="link"
                      className="flex items-center justify-center gap-2"
                    >
                      ENROLL
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
