import { useEffect, useRef, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useFormat } from "@/lib/store-context";
import { blip } from "@/audio/engine";

type Invoice = {
  items: { name: string; qty: number; pricePkr: number }[];
  discountPct: number;
  subtotalPkr: number;
  totalPkr: number;
  whatsappUrl: string;
};

type Msg = { role: "user" | "assistant"; content: string; invoice?: Invoice };

const SUGGESTIONS = [
  "Treadmill price?",
  "I want a discount",
  "Order ON Whey",
  "Delivery info",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Assalam-o-Alaikum. I'm the official AW Sales Closer. Ask me any price in PKR, negotiate a deal, or say “order” + product name — I'll write your invoice and lock it in on WhatsApp.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const fmt = useFormat();
  const chat = trpc.store.chat.useMutation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // magnetic attraction
  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 160 && !open) {
        const pull = (1 - dist / 160) * 18;
        el.style.transform = `translate(${(dx / dist) * pull}px, ${(dy / dist) * pull}px)`;
      } else {
        el.style.transform = "translate(0,0)";
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [open]);

  // external order intent from catalog
  useEffect(() => {
    const handler = (e: Event) => {
      const name = (e as CustomEvent<string>).detail;
      setOpen(true);
      send(`order ${name}`);
    };
    window.addEventListener("aw:order", handler);
    return () => window.removeEventListener("aw:order", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgs]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    blip("click");
    const history = [...msgs, { role: "user" as const, content }];
    setMsgs(history);
    setInput("");
    setBusy(true);
    try {
      const res = await chat.mutateAsync({
        message: content,
        history: history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      });
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: res.reply, invoice: res.invoice as Invoice | undefined },
      ]);
      if (res.invoice) blip("success");
    } catch {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: "Connection hiccup — try again, or reach us directly on WhatsApp via the green button.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* floating magnetic orb */}
      <button
        ref={btnRef}
        onClick={() => {
          setOpen(!open);
          blip("click");
        }}
        className="fixed bottom-6 right-6 z-[95] flex h-16 w-16 items-center justify-center rounded-full border border-[#39ff14]/50 bg-black/60 shadow-[0_0_30px_rgba(57,255,20,0.25)] backdrop-blur-xl transition-transform duration-200"
        style={{ transition: "transform 0.18s ease-out" }}
        data-cursor="hover"
        aria-label="AI Sales Closer"
      >
        {open ? (
          <span className="text-xl text-[#39ff14]">✕</span>
        ) : (
          <span className="relative flex items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-full bg-[#39ff14]/20" />
            <span className="font-display text-lg font-black text-[#39ff14]">AI</span>
          </span>
        )}
      </button>

      {/* glass panel */}
      {open && (
        <div className="glass-panel fixed bottom-24 right-4 z-[95] flex h-[560px] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-xl shadow-2xl md:right-6">
          <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3">
            <div>
              <p className="font-display text-sm font-bold text-white">AW SALES CLOSER</p>
              <p className="font-mono2 flex items-center gap-1.5 text-[9px] tracking-[0.2em] text-[#39ff14]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#39ff14]" />
                ONLINE — PRICES LIVE FROM DATABASE
              </p>
            </div>
            <span className="font-mono2 text-[9px] tracking-[0.2em] text-neutral-600">PKR ✦ COD</span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4" data-cursor="hover">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#39ff14] text-black"
                      : "border border-white/10 bg-white/5 text-neutral-200"
                  }`}
                >
                  {m.content}
                  {m.invoice && (
                    <div className="mt-3 rounded-md border border-[#39ff14]/40 bg-black/60 p-3">
                      <p className="font-mono2 text-center text-[10px] tracking-[0.3em] text-[#39ff14]">
                        — ORDER INVOICE —
                      </p>
                      <div className="mt-2 space-y-1 font-mono2 text-[11px] text-neutral-300">
                        {m.invoice.items.map((it, k) => (
                          <div key={k} className="flex justify-between gap-3">
                            <span className="line-clamp-1">
                              {it.name} ×{it.qty}
                            </span>
                            <span>{fmt(it.pricePkr * it.qty)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between border-t border-white/10 pt-1 text-neutral-500">
                          <span>Subtotal</span>
                          <span>{fmt(m.invoice.subtotalPkr)}</span>
                        </div>
                        <div className="flex justify-between text-[#39ff14]">
                          <span>Insider −{m.invoice.discountPct}%</span>
                          <span>−{fmt(m.invoice.subtotalPkr - m.invoice.totalPkr)}</span>
                        </div>
                        <div className="flex justify-between border-t border-[#39ff14]/30 pt-1 text-sm font-bold text-white">
                          <span>TOTAL</span>
                          <span>{fmt(m.invoice.totalPkr)}</span>
                        </div>
                      </div>
                      <a
                        href={m.invoice.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => blip("success")}
                        className="mt-3 block rounded-sm bg-[#25d366] py-2.5 text-center font-mono2 text-[11px] font-bold tracking-[0.15em] text-black transition-transform hover:scale-[1.02]"
                      >
                        🔒 LOCK IN WHATSAPP DEAL
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#39ff14]"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-black/40 p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-neutral-400 transition-colors hover:border-[#39ff14] hover:text-[#39ff14]"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask price, negotiate, order…"
                className="aw-input flex-1"
              />
              <button
                type="submit"
                disabled={busy}
                className="bg-[#39ff14] px-4 font-mono2 text-xs font-bold text-black disabled:opacity-50"
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
