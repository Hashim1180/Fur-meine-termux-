"use client"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { useRef } from "react"
import { ChevronDown, MessageSquare, ArrowRight } from "lucide-react"
import { useSite } from "@/lib/store"
import { Button } from "@/components/ui/button"

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

/**
 * Letter-splice reveal — each character slides up from behind an overflow-hidden mask.
 * `gradient` flips on the text-gradient-neon class for the second wordmark line.
 */
function WordLine({
  text,
  delayBase,
  gradient = false,
}: {
  text: string
  delayBase: number
  gradient?: boolean
}) {
  return (
    <div className={gradient ? "flex text-gradient-neon" : "flex"}>
      {text.split("").map((ch, i) => (
        <span key={`${text}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            initial={{ y: "115%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.9, delay: delayBase + i * 0.07, ease: EASE }}
            className="inline-block font-display font-black tracking-cinema text-7xl leading-none sm:text-8xl md:text-9xl"
          >
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        </span>
      ))}
    </div>
  )
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const tagline = useSite((s) => s.tagline)
  const brand = useSite((s) => s.brand)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const yVideo: MotionValue<string> = useTransform(scrollYProgress, [0, 1], ["0%", "22%"])
  const scaleVideo: MotionValue<number> = useTransform(scrollYProgress, [0, 1], [1, 1.18])
  const yContent: MotionValue<string> = useTransform(scrollYProgress, [0, 1], ["0%", "55%"])
  const opacityContent: MotionValue<number> = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    [1, 1, 0]
  )

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden"
    >
      {/* Parallax video background */}
      <motion.div
        style={{ y: yVideo, scale: scaleVideo }}
        className="absolute inset-0 h-full w-full will-change-transform"
      >
        <video
          src="/media/videos/facility-dark.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover opacity-50"
        />
      </motion.div>

      {/* Gradient overlays for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--obsidian)]/40 via-[var(--obsidian)]/45 to-[var(--obsidian)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--obsidian)] via-[var(--obsidian)]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-0 grain" />

      {/* Center content */}
      <motion.div
        style={{ y: yContent, opacity: opacityContent }}
        className="relative z-10 flex flex-col items-center px-5 text-center will-change-transform"
      >
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05, ease: EASE }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon)] animate-pulse-neon" />
          <span className="font-mono text-[10px] tracking-mega text-[var(--neon)]/80">
            EST. 2026 · PAKISTAN FLAGSHIP
          </span>
        </motion.div>

        {/* Massive wordmark */}
        <div className="flex flex-col items-center leading-[0.82]">
          <WordLine text={brand.split(" ")[0] ?? "AW"} delayBase={0.15} />
          <WordLine
            text={brand.split(" ")[1] ?? "GYMS"}
            delayBase={0.45}
            gradient
          />
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
          className="mt-6 font-mono text-[11px] tracking-wide-2 text-white/50 sm:text-xs"
        >
          {tagline}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
          className="mt-9 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            asChild
            className="group h-12 rounded-full bg-[var(--neon)] px-7 font-mono text-[11px] tracking-wide-2 text-[var(--obsidian)] transition-shadow hover:bg-[var(--neon)] hover:shadow-[0_0_32px_oklch(0.86_0.21_130_/_45%)]"
          >
            <a href="#catalog" data-cursor="link" className="flex items-center gap-2">
              EXPLORE CATALOG
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="glass h-12 rounded-full border border-[var(--neon)]/30 px-7 font-mono text-[11px] tracking-wide-2 text-white/80 transition-colors hover:border-[var(--neon)]/60 hover:text-white"
          >
            <a href="#chat" data-cursor="link" className="flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-[var(--neon)]" />
              TALK TO ARIA
            </a>
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.a
        href="#manifesto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.45, ease: EASE }}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5"
        data-cursor="link"
        aria-label="Scroll to manifesto"
      >
        <span className="font-mono text-[9px] tracking-mega text-white/40">SCROLL</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10"
        >
          <ChevronDown className="h-3.5 w-3.5 text-[var(--neon)]" />
        </motion.span>
      </motion.a>
    </section>
  )
}
