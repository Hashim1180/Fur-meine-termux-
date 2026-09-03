import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { trpc } from "@/providers/trpc";
import { useFormat, useStore } from "@/lib/store-context";
import { blip } from "@/audio/engine";

gsap.registerPlugin(ScrollTrigger);

type Product = {
  id: number;
  name: string;
  category: "equipment" | "supplements" | "accessories";
  description: string | null;
  pricePkr: number;
  compareAtPkr: number | null;
  mediaType: "image" | "video" | "model3d";
  mediaUrl: string | null;
  embedCode: string | null;
  badge: string | null;
  stock: number;
  featured: boolean;
};

const FILTERS = [
  { key: "all", label: "ALL" },
  { key: "equipment", label: "EQUIPMENT" },
  { key: "supplements", label: "SUPPLEMENTS" },
  { key: "accessories", label: "ACCESSORIES" },
] as const;

function embedSrc(embed: string): string | null {
  const m = embed.match(/src="([^"]+)"/);
  return m?.[1] ?? null;
}

function MediaSlot({ p }: { p: Product }) {
  const [modelOn, setModelOn] = useState(p.mediaType === "model3d");
  const src3d = p.embedCode ? embedSrc(p.embedCode) : null;

  if (p.mediaType === "model3d" && src3d && modelOn) {
    return (
      <div className="relative h-full w-full" data-cursor="drag">
        <iframe
          title={p.name}
          src={src3d}
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; xr-spatial-tracking"
          className="absolute inset-0 h-full w-full"
        />
        <button
          onClick={() => setModelOn(false)}
          className="absolute right-3 top-3 z-10 border border-white/20 bg-black/70 px-3 py-1.5 font-mono2 text-[9px] tracking-[0.2em] text-white hover:border-[#39ff14]"
          data-cursor="hover"
        >
          VIEW PHOTO
        </button>
      </div>
    );
  }
  if (p.mediaType === "model3d" && src3d && !modelOn) {
    return (
      <div className="relative h-full w-full">
        <img src={p.mediaUrl || ""} alt={p.name} className="h-full w-full object-cover" />
        <button
          onClick={() => setModelOn(true)}
          className="absolute right-3 top-3 z-10 border border-[#39ff14]/50 bg-black/70 px-3 py-1.5 font-mono2 text-[9px] tracking-[0.2em] text-[#39ff14]"
          data-cursor="hover"
        >
          VIEW IN 3D
        </button>
      </div>
    );
  }
  if (p.mediaType === "video" && p.mediaUrl) {
    return (
      <video
        src={p.mediaUrl}
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }
  return (
    <img
      src={p.mediaUrl || ""}
      alt={p.name}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

export function Catalog({ onOrder }: { onOrder: (p: Product) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const products = trpc.store.products.useQuery(undefined, { staleTime: 30_000 });
  const fmt = useFormat();
  const { whatsappNumber, currency } = useStore();

  const items = useMemo(() => {
    const list = (products.data || []) as Product[];
    return filter === "all" ? list : list.filter((p) => p.category === filter);
  }, [products.data, filter]);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".cat-reveal").forEach((el) => {
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
  }, [items.length]);

  return (
    <section id="catalog" ref={root} className="relative z-10 py-28 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="cat-reveal font-mono2 text-[10px] tracking-[0.5em] text-[#39ff14]">
              E-COMMERCE SHOWROOM
            </p>
            <h2 className="cat-reveal font-display mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
              THE CATALOG
            </h2>
            <p className="cat-reveal mt-3 font-mono2 text-[11px] tracking-[0.2em] text-neutral-500">
              ALL PRICES IN PAKISTANI RUPEES{currency !== "PKR" ? ` · SHOWING ${currency}` : ""} · ADMIN-CONTROLLED RATES
            </p>
          </div>
          <div className="cat-reveal flex gap-px bg-white/10">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setFilter(f.key);
                  blip("click");
                }}
                className={`px-4 py-2.5 font-mono2 text-[10px] tracking-[0.2em] transition-colors ${
                  filter === f.key
                    ? "bg-[#39ff14] text-black"
                    : "bg-[#0d0d0d] text-neutral-400 hover:text-white"
                }`}
                data-cursor="hover"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {products.isLoading && (
          <div className="mt-20 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#39ff14]" />
          </div>
        )}

        <div className="mt-14 grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => {
            const save = p.compareAtPkr ? p.compareAtPkr - p.pricePkr : 0;
            const waText = encodeURIComponent(
              `Assalam-o-Alaikum AW GYMS! I want to order:\n\n• ${p.name}\n• Price: Rs ${p.pricePkr.toLocaleString("en-PK")}\n\nPlease confirm availability. (awgyms.com)`,
            );
            return (
              <article
                key={p.id}
                className="cat-reveal group relative flex flex-col bg-[#0d0d0d]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#141414]">
                  <MediaSlot p={p} />
                  {p.badge && (
                    <span className="absolute left-3 top-3 z-10 bg-[#39ff14] px-2.5 py-1 font-mono2 text-[9px] font-bold tracking-[0.15em] text-black">
                      {p.badge.toUpperCase()}
                    </span>
                  )}
                  {p.stock === 0 && (
                    <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 font-mono2 text-xs tracking-[0.3em] text-white">
                      ON BACKORDER
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="font-mono2 text-[9px] tracking-[0.3em] text-neutral-600">
                    {p.category.toUpperCase()}
                  </p>
                  <h3 className="font-display mt-2 text-base font-bold leading-snug text-white">
                    {p.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                    {p.description}
                  </p>
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="font-display text-xl font-black text-[#39ff14]">
                      {fmt(p.pricePkr)}
                    </span>
                    {save > 0 && (
                      <span className="font-mono2 text-[11px] text-neutral-600 line-through">
                        {fmt(p.compareAtPkr!)}
                      </span>
                    )}
                  </div>
                  {save > 0 && (
                    <span className="mt-1 font-mono2 text-[10px] tracking-widest text-neutral-500">
                      SAVE {fmt(save)}
                    </span>
                  )}
                  <div className="mt-5 flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        onOrder(p);
                        blip("success");
                      }}
                      className="flex-1 bg-[#39ff14] py-3 font-mono2 text-[10px] font-bold tracking-[0.2em] text-black transition-transform hover:scale-[1.02]"
                      data-cursor="hover"
                    >
                      CLOSE DEAL
                    </button>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${waText}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center border border-white/15 px-4 py-3 font-mono2 text-[10px] tracking-[0.2em] text-white transition-colors hover:border-[#39ff14] hover:text-[#39ff14]"
                      data-cursor="hover"
                    >
                      WHATSAPP
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
