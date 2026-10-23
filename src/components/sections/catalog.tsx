"use client"
import { motion } from "framer-motion"
import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Star, MessageSquare, ArrowRight, PackageX } from "lucide-react"
import { api } from "@/lib/api-client"
import { useSite } from "@/lib/store"
import { formatPrice, currencySymbol } from "@/lib/format"
import type { ProductDTO } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]

function ProductCard({ p }: { p: ProductDTO }) {
  const currency = useSite((s) => s.currency)
  const rates = useSite((s) => s.rates)

  const hasVideo = Boolean(p.video)

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE }}
      whileHover={{ y: -6 }}
      data-cursor="link"
      className="group relative flex flex-col overflow-hidden rounded-xl glass transition-shadow duration-300 hover:border-[var(--neon)]/50 hover:shadow-[0_0_28px_oklch(0.86_0.21_130_/_22%)]"
    >
      {/* Media */}
      <div className="relative aspect-square overflow-hidden bg-black">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition-all duration-500",
            hasVideo && "group-hover:scale-105 group-hover:opacity-0"
          )}
        />
        {hasVideo && (
          <video
            src={p.video}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* Featured pill */}
        {p.featured && (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--neon)] px-2.5 py-1">
            <span className="h-1 w-1 rounded-full bg-[var(--obsidian)]" />
            <span className="font-mono text-[9px] font-bold tracking-mega text-[var(--obsidian)]">
              FEATURED
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {!p.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-white/80">
              <PackageX className="h-7 w-7 text-[var(--crimson)]" />
              <span className="font-mono text-[10px] tracking-mega text-white/70">
                OUT OF STOCK
              </span>
            </div>
          </div>
        )}

        {/* Scan-line tint */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-wide-2 text-[var(--neon)]/70">
            {p.category.toUpperCase()}
          </span>
          <div className="flex items-center gap-1 font-mono text-[10px] text-white/50">
            <Star className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
            <span className="text-white/80">{p.rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="font-display text-lg font-bold tracking-cinema text-white">
          {p.name}
        </h3>
        <p className="text-sm leading-snug text-white/50">{p.tagline}</p>

        {/* Badges */}
        {p.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {p.badges.map((b) => (
              <Badge
                key={b}
                variant="outline"
                className="border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] tracking-wide-2 text-white/60"
              >
                {b.toUpperCase()}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] tracking-mega text-white/40">
              {currency} · {currencySymbol(currency)}
            </span>
            <span className="font-display text-xl font-bold text-[var(--neon)]">
              {formatPrice(p.pricePKR, currency, rates)}
            </span>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 rounded-full border border-white/10 px-3 font-mono text-[10px] tracking-wide-2 text-white/70 transition-colors hover:border-[var(--neon)]/50 hover:text-[var(--neon)]"
          >
            <a href="#chat" data-cursor="link" className="flex items-center gap-1.5">
              ASK ARIA
              <MessageSquare className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

export default function Catalog() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: api.products,
  })
  const currency = useSite((s) => s.currency)

  const [activeCat, setActiveCat] = useState<string>("All")

  const categories = useMemo(() => {
    const set = new Set<string>()
    ;(products ?? []).forEach((p) => set.add(p.category))
    return ["All", ...Array.from(set).sort()]
  }, [products])

  const filtered = useMemo(() => {
    const list = [...(products ?? [])].sort((a, b) => a.order - b.order)
    if (activeCat === "All") return list
    return list.filter((p) => p.category === activeCat)
  }, [products, activeCat])

  return (
    <section
      id="catalog"
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
            04 — CATALOG
          </div>
          <h2 className="mt-3 font-display text-3xl font-black tracking-cinema text-white sm:text-4xl md:text-5xl">
            AUTHENTIC IRON & FUEL
          </h2>
        </div>
        <p className="max-w-md font-mono text-[10px] leading-relaxed tracking-wide-2 text-white/40 sm:text-right">
          PRICES LIVE-CONVERT FROM PKR. SWITCH CURRENCY IN THE HEADER. EVERY ITEM
          CARRIES A BATCH ID AND THE AW SEAL.
        </p>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mb-8 flex flex-wrap gap-2"
      >
        {categories.map((c) => {
          const isActive = activeCat === c
          return (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCat(c)}
              data-cursor="link"
              className={cn(
                "rounded-full border px-4 py-1.5 font-mono text-[10px] tracking-wide-2 transition-all",
                isActive
                  ? "border-[var(--neon)] bg-[var(--neon)] text-[var(--obsidian)] box-glow-neon"
                  : "border-white/10 bg-white/[0.02] text-white/60 hover:border-white/30 hover:text-white"
              )}
            >
              {c.toUpperCase()}
            </button>
          )
        })}
      </motion.div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-xl border border-white/5 bg-white/[0.02]"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mt-12 flex justify-center"
      >
        <Button
          asChild
          variant="ghost"
          className="group h-12 rounded-full border border-[var(--neon)]/30 bg-[var(--neon)]/[0.03] px-7 font-mono text-[11px] tracking-wide-2 text-white/80 transition-colors hover:border-[var(--neon)]/60 hover:text-[var(--neon)]"
        >
          <a href="#chat" data-cursor="link" className="flex items-center gap-2">
            VIEW FULL STACK
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </Button>
      </motion.div>
    </section>
  )
}
