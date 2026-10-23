"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast, Toaster as SonnerToaster } from "sonner"
import { Sparkles, X, Send, RotateCcw, Mic, ArrowUpRight, ShieldCheck } from "lucide-react"
import { useSite } from "@/lib/store"
import { api } from "@/lib/api-client"
import { formatPrice } from "@/lib/format"
import type { ChatMessage, Currency, Invoice } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/* ------------------------------------------------------------------ */
/* Constants & helpers                                                */
/* ------------------------------------------------------------------ */

const GREETING =
  "Welcome to AW GYMS. I'm ARIA — your autonomous concierge. Ask me about authentic supplements, commercial iron, or lock in Insider pricing today."

const QUICK_REPLIES = [
  "Show me the best whey",
  "I need a treadmill for Lahore",
  "What's the Insider discount?",
  "Build me a starter stack",
]

const EASE = [0.2, 0.8, 0.2, 1] as const
const DAY_MS = 24 * 60 * 60 * 1000

/** Extended chat message — carries an optional invoice payload for lock-in UI. */
interface Msg extends ChatMessage {
  invoice?: Invoice | null
}

/** Stable session id with safe fallback for older browsers. */
function makeSessionId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID()
    }
  } catch {
    /* ignore */
  }
  return "sess-" + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/** Locate a SpeechRecognition constructor on window (vendor-prefixed on Safari). */
function getSpeechRecognitionCtor(): { new (): any } | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as {
    SpeechRecognition?: { new (): any }
    webkitSpeechRecognition?: { new (): any }
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export default function AriaChat() {
  const phase = useSite((s) => s.phase)
  const currency = useSite((s) => s.currency)
  const rates = useSite((s) => s.rates)
  const whatsapp = useSite((s) => s.whatsapp)

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [unread, setUnread] = useState(false)

  const sessionIdRef = useRef<string>("")
  const firstUserHandledRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const speechSupportedRef = useRef<boolean>(false)

  /* ---- one-time init ---- */
  useEffect(() => {
    sessionIdRef.current = makeSessionId()
    speechSupportedRef.current = !!getSpeechRecognitionCtor()
  }, [])

  /* ---- phantom callback: build the initial message list on first open ---- */
  const buildInitialMessages = useCallback((): Msg[] => {
    const base: Msg[] = [{ role: "assistant", content: GREETING }]
    if (typeof window === "undefined") return base
    try {
      const lastSeenRaw = window.localStorage.getItem("aria_last_seen")
      const lastTopic = window.localStorage.getItem("aria_last_topic")
      if (lastSeenRaw && lastTopic !== null) {
        const lastSeen = parseInt(lastSeenRaw, 10)
        if (Number.isFinite(lastSeen) && Date.now() - lastSeen > DAY_MS) {
          const topic = lastTopic.trim() || "the catalog"
          const phantom = `You were exploring "${topic}" last visit. The facility in Lahore just received a new shipment. Coincidence?`
          // refresh timestamp so the phantom doesn't repeat on every open
          window.localStorage.setItem("aria_last_seen", String(Date.now()))
          return [{ role: "assistant", content: phantom }, ...base]
        }
      }
    } catch {
      /* localStorage may be blocked — fail silently */
    }
    return base
  }, [])

  /* ---- initialize messages the first time the panel opens ---- */
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages(buildInitialMessages())
      setUnread(false)
    }
  }, [open, messages.length, buildInitialMessages])

  /* ---- autoscroll to bottom on new content ---- */
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  /* ---- reset chat (new chat button) ---- */
  const resetChat = useCallback(() => {
    setMessages([{ role: "assistant", content: GREETING }])
    setInput("")
    setLoading(false)
    setListening(false)
    firstUserHandledRef.current = false
    try {
      recognitionRef.current?.stop?.()
    } catch {
      /* ignore */
    }
  }, [])

  /* ---- core send flow ---- */
  const sendMessage = useCallback(
    async (raw: string) => {
      const content = raw.trim()
      if (!content || loading) return

      /* record topic on first user message (for next-session phantom callback) */
      if (!firstUserHandledRef.current) {
        firstUserHandledRef.current = true
        try {
          window.localStorage.setItem("aria_last_seen", String(Date.now()))
          window.localStorage.setItem("aria_last_topic", content.slice(0, 40))
        } catch {
          /* ignore */
        }
      }

      const userMsg: Msg = { role: "user", content }
      const nextMessages = [...messages, userMsg]
      setMessages(nextMessages)
      setInput("")
      setLoading(true)

      try {
        const payload: ChatMessage[] = nextMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }))
        const res = await api.chat({
          sessionId: sessionIdRef.current,
          messages: payload,
          currency,
        })
        const replyMsg: Msg = {
          role: "assistant",
          content: res.reply,
          invoice: res.invoice ?? null,
        }
        setMessages((m) => [...m, replyMsg])
        if (!open) setUnread(true)
      } catch (err: any) {
        toast.error("ARIA is offline", {
          description: err?.message ? String(err.message) : "Please retry in a moment.",
        })
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "Connection dropped — I'm still here. Try sending that again in a moment.",
          },
        ])
      } finally {
        setLoading(false)
      }
    },
    [messages, loading, currency, open],
  )

  /* ---- keyboard: Enter to send, Shift+Enter for newline ---- */
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  /* ---- voice input via webkit SpeechRecognition ---- */
  const toggleMic = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) return
    if (listening && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        /* ignore */
      }
      setListening(false)
      return
    }
    const rec: any = new Ctor()
    rec.lang = "en-US"
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (e: any) => {
      const transcript: string = e?.results?.[0]?.[0]?.transcript ?? ""
      if (transcript) {
        setInput((prev) => (prev ? prev.trimEnd() + " " + transcript : transcript))
      }
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recognitionRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }, [listening])

  /* ---- whatsapp deep-link with invoice summary ---- */
  const buildWhatsAppUrl = useCallback(
    (inv: Invoice): string => {
      const digits = (whatsapp || "").replace(/[^0-9]/g, "")
      const lines: string[] = [
        "AW GYMS — ARIA Order Confirmation",
        `Invoice: ${inv.id}`,
        "",
        "Items:",
        ...inv.items.map(
          (it) =>
            `• ${it.name} × ${it.qty} — ${formatPrice(it.totalPKR, inv.currency, rates)}`,
        ),
        "",
        `Subtotal: ${formatPrice(inv.subtotalPKR, inv.currency, rates)}`,
        `Insider discount (−${inv.discountPct}%): −${formatPrice(
          inv.discountPKR,
          inv.currency,
          rates,
        )}`,
        `TOTAL: ${formatPrice(inv.totalPKR, inv.currency, rates)}`,
      ]
      if (inv.customerNote) lines.push("", inv.customerNote)
      return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`
    },
    [whatsapp, rates],
  )

  /* ---- visibility gate: only render during the main site phase ---- */
  if (phase !== "site") return null

  const showQuickReplies = messages.length <= 1 && !loading

  return (
    <>
      {/* Sonner toaster — self-contained (global layout only mounts the radix toaster) */}
      <SonnerToaster position="top-center" richColors closeButton theme="dark" />

      {/* anchor target for `#chat` deep-links */}
      <span id="chat" className="sr-only" aria-label="ARIA concierge chat" />

      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="aria-panel"
            className="glass-strong fixed bottom-4 right-4 z-50 flex w-[min(92vw,420px)] flex-col overflow-hidden rounded-2xl"
            style={{ maxHeight: "min(80vh,640px)" }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.32, ease: EASE }}
            role="dialog"
            aria-label="ARIA concierge"
          >
            {/* ---------- Header ---------- */}
            <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
              <div className="box-glow-neon relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--neon)]/10 text-[var(--neon)]">
                <span className="font-mono text-sm font-bold">A</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm font-bold tracking-wide text-white">
                    ARIA
                  </span>
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                    style={{ boxShadow: "0 0 8px rgba(16,185,129,0.7)" }}
                    aria-label="online"
                  />
                </div>
                <div className="font-mono text-[9px] uppercase tracking-mega text-white/40">
                  Autonomous Concierge
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
              <button
                onClick={resetChat}
                className="flex h-8 w-8 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/5 hover:text-[var(--neon)]"
                aria-label="Start a new chat"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">New chat</TooltipContent>
              </Tooltip>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Close ARIA"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ---------- Messages ---------- */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-3 py-4"
            >
              {messages.map((m, i) => (
                <div key={i} className="space-y-2">
                  {m.role === "assistant" ? (
                    <div className="flex justify-start">
                      <div className="glass max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-relaxed text-white/80">
                        {m.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-[var(--neon)] px-3.5 py-2.5 text-sm font-medium leading-relaxed text-[var(--obsidian)]">
                        {m.content}
                      </div>
                    </div>
                  )}

                  {m.invoice ? (
                    <InvoiceCard
                      inv={m.invoice}
                      waUrl={buildWhatsAppUrl(m.invoice)}
                      currency={currency}
                      rates={rates}
                      onRegenerate={() =>
                        sendMessage("Actually, regenerate the invoice")
                      }
                    />
                  ) : null}
                </div>
              ))}

              {/* typing indicator */}
              {loading ? (
                <div className="flex justify-start">
                  <div className="glass flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-[var(--neon)]"
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{
                          duration: 0.9,
                          repeat: Infinity,
                          delay: d * 0.15,
                          ease: EASE,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            {/* ---------- Quick replies ---------- */}
            <AnimatePresence initial={false}>
              {showQuickReplies ? (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="overflow-hidden px-3 pb-1"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REPLIES.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] tracking-wide-2 text-white/60 transition-colors hover:border-[var(--neon)]/40 hover:text-[var(--neon)]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* ---------- Input row ---------- */}
            <div className="border-t border-white/5 p-3">
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Message ARIA…"
                  rows={1}
                  className="min-h-[44px] max-h-32 resize-none overflow-y-auto border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus-visible:border-[var(--neon)]/40 focus-visible:ring-0"
                  aria-label="Message ARIA"
                />
                {speechSupportedRef.current ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={toggleMic}
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors",
                          listening
                            ? "border-[var(--crimson)]/60 text-[var(--crimson)]"
                            : "border-white/10 text-white/60 hover:border-[var(--neon)]/40 hover:text-[var(--neon)]",
                        )}
                        aria-label={listening ? "Stop voice input" : "Start voice input"}
                      >
                        <Mic className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {listening ? "Listening…" : "Voice input"}
                    </TooltipContent>
                  </Tooltip>
                ) : null}
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="box-glow-neon h-9 w-9 shrink-0 bg-[var(--neon)] text-[var(--obsidian)] hover:bg-[var(--neon)]/90 disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 text-center font-mono text-[9px] tracking-wide-2 text-white/30">
                Powered by neural concierge · {currency} live rates
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="aria-launcher"
            className="fixed bottom-5 right-5 z-50 sm:bottom-4 sm:right-4"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setOpen(true)
                    setUnread(false)
                  }}
                  className="glass-strong box-glow-neon animate-pulse-neon group relative flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-105"
                  aria-label="Ask ARIA"
                >
                  <Sparkles className="h-5 w-5 text-[var(--neon)] transition-all group-hover:text-glow-neon" />
                  {unread ? (
                    <span
                      className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[var(--crimson)]"
                      style={{ boxShadow: "0 0 8px rgba(255,61,92,0.7)" }}
                      aria-label="unread reply"
                    />
                  ) : null}
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">Ask ARIA</TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Invoice lock-in card                                               */
/* ------------------------------------------------------------------ */

function InvoiceCard({
  inv,
  waUrl,
  currency,
  rates,
  onRegenerate,
}: {
  inv: Invoice
  waUrl: string
  currency: Currency
  rates: { usdRate: number; aedRate: number }
  onRegenerate: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="glass-strong box-glow-neon mt-2 rounded-xl border border-[var(--neon)]/40 p-4"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[var(--neon)]" />
          <span className="font-mono text-[10px] tracking-mega text-[var(--neon)]">
            INVOICE
          </span>
        </div>
        <span className="font-mono text-[10px] text-white/40">{inv.id}</span>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {inv.items.map((it, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 text-xs"
          >
            <span className="min-w-0 flex-1 truncate text-white/80">
              {it.name}{" "}
              <span className="text-white/40">× {it.qty}</span>
            </span>
            <span className="font-mono text-white/70">
              {formatPrice(it.totalPKR, currency, rates)}
            </span>
          </div>
        ))}
      </div>

      <div className="my-3 h-px hr-neon" />

      {/* Totals */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between text-white/60">
          <span>Subtotal</span>
          <span className="font-mono">
            {formatPrice(inv.subtotalPKR, currency, rates)}
          </span>
        </div>
        <div className="flex justify-between text-[var(--crimson)]">
          <span>−{inv.discountPct}% INSIDER</span>
          <span className="font-mono">
            −{formatPrice(inv.discountPKR, currency, rates)}
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-mega text-white/50">
          TOTAL
        </span>
        <span className="text-glow-neon font-mono text-lg font-bold text-[var(--neon)]">
          {formatPrice(inv.totalPKR, currency, rates)}
        </span>
      </div>

      {inv.customerNote ? (
        <p className="mt-2 text-[11px] italic text-white/40">
          {inv.customerNote}
        </p>
      ) : null}

      <a
        href={waUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--neon)] py-2.5 font-mono text-[10px] tracking-mega text-[var(--obsidian)] transition-colors hover:bg-[var(--neon)]/90"
      >
        CONFIRM ON WHATSAPP
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
      <button
        onClick={onRegenerate}
        className="mt-2 w-full text-center font-mono text-[9px] tracking-wide-2 text-white/30 transition-colors hover:text-white/60"
      >
        regenerate invoice
      </button>
    </motion.div>
  )
}
