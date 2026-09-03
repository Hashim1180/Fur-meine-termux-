import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { trpc } from "@/providers/trpc";
import { useFormat, useStore } from "@/lib/store-context";
import { blip } from "@/audio/engine";

gsap.registerPlugin(ScrollTrigger);

type Ev = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  startAt: string | Date;
  seats: number;
  pricePkr: number;
  status: "upcoming" | "archived";
};

function useCountdown(target: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff <= 0 };
}

function EventCard({
  ev,
  next,
  onBook,
}: {
  ev: Ev;
  next: boolean;
  onBook: (ev: Ev) => void;
}) {
  const target = new Date(ev.startAt).getTime();
  const { d, h, m, s } = useCountdown(target);
  const fmt = useFormat();
  const archived = ev.status === "archived" || target <= Date.now();
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <article
      className={`ev-reveal relative flex flex-col border bg-[#0d0d0d] p-6 transition-colors ${
        next && !archived
          ? "border-[#39ff14]/60 shadow-[0_0_40px_rgba(57,255,20,0.08)]"
          : "border-white/10"
      } ${archived ? "opacity-55" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono2 text-[9px] tracking-[0.3em] text-neutral-500">
          {(ev.category || "EVENT").toUpperCase()}
        </span>
        {archived ? (
          <span className="border border-white/20 px-2 py-1 font-mono2 text-[9px] tracking-[0.2em] text-neutral-500">
            ARCHIVED
          </span>
        ) : next ? (
          <span className="bg-[#39ff14] px-2 py-1 font-mono2 text-[9px] font-bold tracking-[0.2em] text-black">
            NEXT UP
          </span>
        ) : (
          <span className="border border-[#39ff14]/40 px-2 py-1 font-mono2 text-[9px] tracking-[0.2em] text-[#39ff14]">
            UPCOMING
          </span>
        )}
      </div>

      <h3 className="font-display mt-4 text-xl font-black leading-tight text-white">
        {ev.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-neutral-500">
        {ev.description}
      </p>

      <div className="mt-4 space-y-1.5 font-mono2 text-[10px] tracking-[0.15em] text-neutral-400">
        <p>
          <span className="text-neutral-600">DATE&nbsp;&nbsp;</span>
          {new Date(ev.startAt).toLocaleString("en-PK", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Karachi",
          })}{" "}
          PKT
        </p>
        <p>
          <span className="text-neutral-600">WHERE&nbsp;</span>
          {ev.location}
        </p>
        <p>
          <span className="text-neutral-600">SEATS&nbsp;</span>
          {ev.seats} · {ev.pricePkr > 0 ? fmt(ev.pricePkr) : "FREE ENTRY"}
        </p>
      </div>

      {!archived && (
        <div className="mt-5 grid grid-cols-4 gap-px bg-white/10">
          {[
            { v: pad(d), l: "DAYS" },
            { v: pad(h), l: "HRS" },
            { v: pad(m), l: "MIN" },
            { v: pad(s), l: "SEC" },
          ].map((u) => (
            <div key={u.l} className="bg-black/60 py-3 text-center">
              <p className="font-display text-xl font-black text-[#39ff14]">{u.v}</p>
              <p className="font-mono2 text-[8px] tracking-[0.25em] text-neutral-600">{u.l}</p>
            </div>
          ))}
        </div>
      )}

      {/* progress bar to event (14-day window visual) */}
      {!archived && (
        <div className="mt-4 h-1 w-full bg-white/5">
          <div
            className="h-full bg-[#39ff14]/70 transition-all duration-1000"
            style={{
              width: `${Math.min(100, Math.max(4, 100 - (target - Date.now()) / (15 * 86400) * 100))}%`,
            }}
          />
        </div>
      )}

      <button
        disabled={archived}
        onClick={() => {
          onBook(ev);
          blip("success");
        }}
        className={`mt-6 py-3 font-mono2 text-[10px] font-bold tracking-[0.25em] transition-transform ${
          archived
            ? "cursor-not-allowed border border-white/10 text-neutral-600"
            : "bg-[#39ff14] text-black hover:scale-[1.02]"
        }`}
        data-cursor="hover"
      >
        {archived ? "COURSE CONCLUDED" : "RESERVE SEAT"}
      </button>
    </article>
  );
}

export function Events() {
  const root = useRef<HTMLDivElement>(null);
  const events = trpc.store.events.useQuery(undefined, {
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const { whatsappNumber } = useStore();

  const { upcoming, archived, nextId } = useMemo(() => {
    const list = (events.data || []) as Ev[];
    const now = Date.now();
    const up = list
      .filter((e) => e.status === "upcoming" && new Date(e.startAt).getTime() > now)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    const ar = list.filter(
      (e) => e.status === "archived" || new Date(e.startAt).getTime() <= now,
    );
    return { upcoming: up, archived: ar, nextId: up[0]?.id ?? null };
  }, [events.data]);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".ev-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          },
        );
      });
    }, root);
    return () => ctx.revert();
  }, [events.data]);

  const book = (ev: Ev) => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum AW GYMS! I want to reserve a seat:\n\n• Event: ${ev.title}\n• Date: ${new Date(ev.startAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" })} PKT\n• Fee: ${ev.pricePkr > 0 ? `Rs ${ev.pricePkr.toLocaleString("en-PK")}` : "Free"}\n\nPlease confirm my booking. (awgyms.com)`,
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
  };

  return (
    <section id="events" ref={root} className="relative z-10 border-t border-white/5 bg-[#0c0c0c] py-28 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="ev-reveal font-mono2 text-[10px] tracking-[0.5em] text-[#39ff14]">
              ELITE COURSES — EVERY 15 DAYS
            </p>
            <h2 className="ev-reveal font-display mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
              EVENTS &<span className="text-stroke"> COURSES</span>
            </h2>
          </div>
          <p className="ev-reveal max-w-sm text-sm leading-relaxed text-neutral-500">
            A new premium course drops every fifteen days. When a countdown hits zero,
            the card archives itself and the next course takes the spotlight — automatically.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.map((ev) => (
            <EventCard key={ev.id} ev={ev} next={ev.id === nextId} onBook={book} />
          ))}
          {archived.map((ev) => (
            <EventCard key={ev.id} ev={ev} next={false} onBook={book} />
          ))}
        </div>

        {events.isLoading && (
          <div className="mt-16 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#39ff14]" />
          </div>
        )}
      </div>
    </section>
  );
}
