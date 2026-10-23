"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useSite } from "@/lib/store"

export default function AnnouncementBar() {
  const announcement = useSite((s) => s.announcement)
  const phase = useSite((s) => s.phase)
  if (phase !== "site" || !announcement) return null
  return (
    <div className="relative z-50 w-full overflow-hidden border-b border-white/5 bg-[var(--charcoal)]">
      <motion.div
        className="flex whitespace-nowrap py-2 font-mono text-[10px] tracking-wide-2 text-[var(--neon)]/80"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="px-8">
            ◆ {announcement}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
