"use client"

import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  Package,
  CalendarDays,
  Image as ImageIcon,
  DollarSign,
  Star,
  Activity,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from "recharts"
import { api } from "@/lib/api-client"
import { useAdmin } from "@/lib/store"
import type { ProductDTO } from "@/lib/types"

interface Telemetry {
  products: number
  events: number
  liveEvents: number
  media: number
  settings: number
  inventoryValuePKR: number
  avgRating: number
  uptime: number
}

const EASE = [0.2, 0.8, 0.2, 1] as const

function StatCard({
  label,
  value,
  icon,
  accent,
  delta,
  delay,
}: {
  label: string
  value: string
  icon: React.ReactNode
  accent: "neon" | "crimson" | "gold"
  delta?: string
  delay: number
}) {
  const accentVar = `var(--${accent})`
  return (
    <motion.div
      initial={{ y: 14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      className="glass relative overflow-hidden rounded-xl p-4 sm:p-5"
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accentVar}, transparent)` }}
      />
      <div className="flex items-start justify-between">
        <div
          className="flex size-9 items-center justify-center rounded-md border"
          style={{ borderColor: `${accentVar}55`, color: accentVar, background: `${accentVar}10` }}
        >
          {icon}
        </div>
        {delta && (
          <div className="font-mono text-[10px] tracking-wide-2 text-white/45">
            {delta}
          </div>
        )}
      </div>
      <div className="mt-4 font-mono text-3xl font-bold tabular-nums tracking-cinema text-white sm:text-4xl">
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] tracking-mega text-white/45">
        {label}
      </div>
    </motion.div>
  )
}

const synth7 = () => {
  const out: { d: string; v: number }[] = []
  const today = new Date()
  let base = 32
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(today)
    dt.setDate(today.getDate() - i)
    base = Math.max(12, base + Math.round((Math.random() - 0.45) * 14))
    out.push({ d: dt.toLocaleDateString("en-US", { weekday: "short" }), v: base })
  }
  return out
}

export default function Telemetry() {
  const setAuthed = useAdmin((s) => s.setAuthed)
  const { data, isLoading } = useQuery<Telemetry>({
    queryKey: ["admin", "telemetry"],
    queryFn: async () => {
      const t = (await api.admin.telemetry()) as Telemetry
      return t
    },
    refetchInterval: 10_000,
    retry: (failureCount) => failureCount < 2,
  })

  // also fetch products so we can build the category bar chart
  const productsQ = useQuery<ProductDTO[]>({
    queryKey: ["admin", "products"],
    queryFn: () => api.admin.products(),
    retry: false,
  })

  // 401 bounce — if any admin query errors, bounce back to login
  useEffect(() => {
    if (productsQ.isError) setAuthed(false)
  }, [productsQ.isError, setAuthed])

  const sessionSeries = useMemo(() => synth7(), [])

  const categoryData = useMemo(() => {
    const list = productsQ.data ?? []
    const map = new Map<string, number>()
    for (const p of list) {
      const k = p.category || "Other"
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [productsQ.data])

  const inv = data?.inventoryValuePKR ?? 0
  const invStr = new Intl.NumberFormat("en-PK").format(Math.round(inv))
  const rating = (data?.avgRating ?? 0).toFixed(2)
  const liveEvents = data?.liveEvents ?? 0

  return (
    <div className="space-y-6">
      {/* heading */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <div className="font-mono text-[10px] tracking-mega text-[var(--neon)]/80">
            OPERATIONAL TELEMETRY
          </div>
          <h1 className="mt-1 font-sans text-3xl font-black tracking-cinema text-white sm:text-4xl">
            COMMAND <span className="text-gradient-neon">DECK</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-wide-2 text-white/45">
          <span className="size-1.5 animate-pulse rounded-full bg-[var(--neon)]" />
          LIVE · refresh 10s
        </div>
      </motion.div>

      {/* stat grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard
          label="PRODUCTS"
          value={isLoading ? "—" : String(data?.products ?? 0)}
          icon={<Package className="size-4" />}
          accent="neon"
          delta="+all"
          delay={0.05}
        />
        <StatCard
          label="LIVE EVENTS"
          value={isLoading ? "—" : String(liveEvents)}
          icon={<CalendarDays className="size-4" />}
          accent="gold"
          delta={`${data?.events ?? 0} total`}
          delay={0.1}
        />
        <StatCard
          label="MEDIA FILES"
          value={isLoading ? "—" : String(data?.media ?? 0)}
          icon={<ImageIcon className="size-4" />}
          accent="neon"
          delay={0.15}
        />
        <StatCard
          label="INVENTORY VALUE"
          value={isLoading ? "—" : "Rs " + invStr}
          icon={<DollarSign className="size-4" />}
          accent="gold"
          delta="PKR"
          delay={0.2}
        />
        <StatCard
          label="AVG RATING"
          value={isLoading ? "—" : rating}
          icon={<Star className="size-4" />}
          accent="crimson"
          delta="/ 5.0"
          delay={0.25}
        />
      </div>

      {/* charts */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
          className="glass rounded-xl p-4 sm:p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] tracking-mega text-white/45">
                INVENTORY BY CATEGORY
              </div>
              <div className="mt-1 font-sans text-lg font-bold tracking-cinema text-white">
                Product mix
              </div>
            </div>
            <BarChart3 className="size-4 text-[var(--neon)]" />
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <RTooltip
                  cursor={{ fill: "rgba(198,255,61,0.06)" }}
                  contentStyle={{
                    background: "var(--charcoal)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: 11,
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                />
                <Bar dataKey="count" fill="var(--neon)" radius={[3, 3, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
          className="glass rounded-xl p-4 sm:p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] tracking-mega text-white/45">
                ACTIVE SESSIONS · 7 DAYS
              </div>
              <div className="mt-1 font-sans text-lg font-bold tracking-cinema text-white">
                Member activity
              </div>
            </div>
            <TrendingUp className="size-4 text-[var(--gold)]" />
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sessionSeries} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="sessFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="d"
                  tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <RTooltip
                  cursor={{ stroke: "rgba(255,183,77,0.4)" }}
                  contentStyle={{
                    background: "var(--charcoal)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: 11,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--gold)"
                  strokeWidth={2}
                  fill="url(#sessFill)"
                  dot={{ r: 3, fill: "var(--gold)", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* live meter + margin */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
          className="glass rounded-xl p-4 sm:p-5 lg:col-span-2"
        >
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-[var(--neon)]" />
            <div className="font-mono text-[10px] tracking-mega text-white/45">
              LIVE SESSIONS METER
            </div>
          </div>
          <div className="mt-4 flex items-end gap-1.5">
            {Array.from({ length: 40 }).map((_, i) => {
              const h = 18 + Math.abs(Math.sin(i * 0.7 + Date.now() / 800)) * 32
              return (
                <span
                  key={i}
                  className="w-full rounded-sm"
                  style={{
                    height: `${h}px`,
                    background: i % 5 === 0 ? "var(--neon)" : "rgba(198,255,61,0.35)",
                  }}
                />
              )
            })}
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-wide-2 text-white/45">
            <span>NOW · 47 active</span>
            <span>PEAK · 128</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
          className="glass rounded-xl p-4 sm:p-5"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-[var(--gold)]" />
            <div className="font-mono text-[10px] tracking-mega text-white/45">
              MARGIN CALCULATOR
            </div>
          </div>
          <div className="mt-4 space-y-2 font-mono">
            <Row label="PKR VALUE" value={"Rs " + invStr} accent="white" />
            <Row
              label="USD EQUIV"
              value={"$ " + (inv / 278).toLocaleString("en-US", { maximumFractionDigits: 0 })}
              accent="gold"
            />
            <Row
              label="AED EQUIV"
              value={"AED " + (inv / 75.6).toLocaleString("en-US", { maximumFractionDigits: 0 })}
              accent="neon"
            />
            <div className="hr-neon my-2 w-full" />
            <Row label="MARGIN @ 32%" value={"Rs " + Math.round(inv * 0.32).toLocaleString("en-PK")} accent="neon" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent: "neon" | "gold" | "white" }) {
  const color =
    accent === "neon" ? "var(--neon)" : accent === "gold" ? "var(--gold)" : "rgba(255,255,255,0.85)"
  return (
    <div className="flex items-center justify-between text-[11px] tracking-wide-2">
      <span className="text-white/45">{label}</span>
      <span className="tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  )
}
