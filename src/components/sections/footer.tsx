"use client"
import { useEffect, useState } from "react"
import { useSite } from "@/lib/store"

const COLS = [
  {
    title: "Facility",
    items: ["Lahore · Gulberg Flagship", "Karachi · Clifton Studio", "Islamabad · F-7 Performance Lab", "Open 24/7"],
  },
  {
    title: "Disciplines",
    items: ["Strength Foundations", "Hypertrophy Block", "Conditioning Circuit", "Recovery & Mobility"],
  },
  {
    title: "Concierge",
    items: ["ARIA AI Sales Closer", "WhatsApp +92 349 7814918", "White-glove Installation", "Batch Traceability"],
  },
]

export default function Footer() {
  const brand = useSite((s) => s.brand)
  const tagline = useSite((s) => s.tagline)
  const whatsapp = useSite((s) => s.whatsapp)
  const [time, setTime] = useState("")
  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Karachi" }).format(new Date()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer className="relative mt-auto border-t border-white/5 bg-[var(--obsidian)]">
      <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="font-display text-2xl font-black tracking-cinema text-white">
              {brand.split(" ")[0]} <span className="text-white/40">{brand.split(" ")[1]}</span>
            </div>
            <p className="mt-2 font-mono text-[10px] tracking-wide-2 text-white/40">{tagline}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--neon)]/30 bg-[var(--neon)]/5 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon)] animate-pulse-neon" />
              <span className="font-mono text-[10px] tracking-wide-2 text-white/70">LIVE · KHI {time}</span>
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <div className="font-mono text-[10px] tracking-mega text-[var(--neon)]/70">{c.title.toUpperCase()}</div>
              <ul className="mt-4 space-y-2">
                {c.items.map((it) => (
                  <li key={it} className="font-sans text-sm text-white/55 transition-colors hover:text-white">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[10px] tracking-wide-2 text-white/30">
            © {new Date().getFullYear()} {brand}. Engineered in Pakistan. Powered by the neural concierge.
          </p>
          <a
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 font-mono text-[10px] tracking-wide-2 text-white/50 hover:text-[var(--neon)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--neon)] transition-transform group-hover:scale-150" />
            WHATSAPP CONCIERGE
          </a>
        </div>
      </div>
    </footer>
  )
}
