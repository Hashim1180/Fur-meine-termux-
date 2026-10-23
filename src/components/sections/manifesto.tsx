"use client"
import { motion } from "framer-motion"
import { useRef } from "react"

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

const BLOCKS = [
  {
    num: "01 — DISCIPLINE",
    title: "Built on the rep, not the trend.",
    body: "Every product we ship has been vetted against the only test that matters: does it survive 5am, six days a week, for a decade? We carry what works. We refuse what doesn't — even when the margin is tempting.",
  },
  {
    num: "02 — AUTHENTICITY",
    title: "Batch-traceable, or it doesn't enter.",
    body: "Every tub of whey, every plate, every dumbbell is sourced through authorised channels and sealed with a verifiable batch ID. Scan it. Verify it. Refuse the grey market entirely.",
  },
  {
    num: "03 — ARCHITECTURE",
    title: "The gym is a system, not a room.",
    body: "Cardio on the perimeter. Strength on the platform. Recovery in the bay. Flow engineered by a coach who's built seven flagships — not by a sales rep with a floor plan.",
  },
  {
    num: "04 — CONCIERGE",
    title: "ARIA closes. You commit.",
    body: "Our neural concierge reads your goals, your currency, your city — and returns a single sealed recommendation. No upsells. No carousel. One path, fully traceable to your door.",
  },
]

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null)

  return (
    <section
      id="manifesto"
      ref={ref}
      className="relative mx-auto max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 md:py-36"
    >
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        {/* LEFT — pinned product film */}
        <div className="md:sticky md:top-24 md:self-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative overflow-hidden rounded-2xl border border-white/10 grain"
          >
            <video
              src="/media/videos/product-whey.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="aspect-video w-full object-cover"
            />
            {/* caption pill */}
            <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon)] animate-pulse-neon" />
              <span className="font-mono text-[9px] tracking-mega text-white/70">
                ON WHEY · PRODUCT FILM
              </span>
            </div>
            {/* corner crosshair */}
            <div className="pointer-events-none absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center">
              <div className="absolute inset-0 rounded border border-white/20" />
              <div className="absolute left-1/2 h-3 w-px -translate-x-1/2 bg-white/30" />
              <div className="absolute top-1/2 h-px w-3 -translate-y-1/2 bg-white/30" />
            </div>
          </motion.div>
          <p className="mt-4 font-mono text-[10px] tracking-wide-2 text-white/40">
            FILM 01 — BATCH 2026/W·042
          </p>
        </div>

        {/* RIGHT — flowing manifesto blocks */}
        <div className="flex flex-col gap-14 md:gap-20">
          {/* Section intro */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="font-mono text-[10px] tracking-mega text-[var(--neon)]/80">
              02 — MANIFESTO
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-cinema text-white sm:text-4xl md:text-5xl">
              We are not a supplement store.
            </h2>
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-white/55">
              We are the system underneath the physique — the chassis, the fuel line,
              the protocol. Four commitments hold the whole thing up.
            </p>
          </motion.div>

          {BLOCKS.map((b, i) => (
            <motion.article
              key={b.num}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: EASE }}
              className="relative pl-6"
            >
              <span className="absolute left-0 top-1 h-[calc(100%-1.5rem)] w-px bg-gradient-to-b from-[var(--neon)]/40 to-transparent" />
              <div className="font-mono text-[10px] tracking-mega text-[var(--neon)]">
                {b.num}
              </div>
              <h3 className="mt-3 font-display text-3xl font-black tracking-cinema text-white sm:text-4xl">
                {b.title}
              </h3>
              <p className="mt-3 max-w-prose leading-relaxed text-white/60">{b.body}</p>
            </motion.article>
          ))}

          {/* Closing line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="flex flex-col gap-6"
          >
            <div className="hr-neon w-full" />
            <p className="font-display text-2xl font-black tracking-cinema text-gradient-neon sm:text-3xl md:text-4xl">
              This is not a store. This is a system.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
