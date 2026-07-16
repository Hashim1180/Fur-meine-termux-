import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { k: "150+", v: "FACILITIES SPEC'D" },
  { k: "100%", v: "ORIGINAL IMPORTS" },
  { k: "15", v: "DAY COURSE CYCLE" },
  { k: "24/7", v: "WHATSAPP CLOSERS" },
];

export function Manifesto() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".mani-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          },
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative z-10 mx-auto max-w-[1500px] px-5 py-28 md:px-10 md:py-40">
      <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="mani-reveal font-mono2 text-[10px] tracking-[0.5em] text-[#39ff14]">
            THE AW DOCTRINE
          </p>
          <h2 className="mani-reveal font-display mt-6 text-4xl font-black leading-[1.02] tracking-tight text-white md:text-6xl">
            WE DON'T SELL
            <br />
            EQUIPMENT.
            <br />
            <span className="text-stroke">WE BUILD</span>
            <br />
            <span className="text-[#39ff14]">ENVIRONMENTS.</span>
          </h2>
          <p className="mani-reveal mt-8 max-w-lg text-sm leading-relaxed text-neutral-400 md:text-base">
            From a single home studio to a full commercial floor, every AW project is
            engineered end-to-end — layout design in interactive 3D, commercial-grade
            machines, verified-original sports nutrition, and elite coaching courses
            every fifteen days. One brand. One standard. Zero compromise.
          </p>
          <div className="mani-reveal mt-12 grid grid-cols-2 gap-px bg-white/10">
            {STATS.map((s) => (
              <div key={s.v} className="bg-[#0d0d0d] p-6">
                <p className="font-display text-3xl font-black text-[#39ff14] md:text-4xl">{s.k}</p>
                <p className="font-mono2 mt-2 text-[10px] tracking-[0.25em] text-neutral-500">{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mani-reveal relative">
          <div className="sticky top-28 overflow-hidden border border-white/10">
            <video
              src="/assets/videos/facility-tour.mp4"
              className="aspect-[9/16] w-full object-cover md:aspect-[4/5]"
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <p className="font-mono2 text-[10px] tracking-[0.35em] text-[#39ff14]">
                AW FLAGSHIP — DESIGN PREVIEW
              </p>
              <p className="font-display mt-2 text-xl font-bold text-white">
                Reception · Strength Floor · Cardio Deck
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
