import { useEffect, useRef } from "react";
import gsap from "gsap";
import { blip } from "@/audio/engine";

export function Hero({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !root.current) return;
    const els = root.current.querySelectorAll(".hero-anim");
    gsap.fromTo(
      els,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: "power3.out", delay: 0.15 },
    );
  }, [active]);

  const go = (sel: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    blip("click");
    document.querySelector(sel)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="top" ref={root} className="relative flex min-h-screen flex-col overflow-hidden">
      {/* ambient background video */}
      <div className="absolute inset-0">
        <video
          src="/assets/videos/facility-dark.mp4"
          className="h-full w-full object-cover opacity-40"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/40 to-[#0a0a0a]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-center px-5 pt-40 md:px-10">
        <p className="hero-anim font-mono2 text-[10px] tracking-[0.5em] text-[#39ff14] md:text-xs">
          EST. LAHORE — ENGINEERED FOR PAKISTAN
        </p>
        <h1 className="font-display mt-6 text-[17vw] font-black leading-[0.85] tracking-tight md:text-[11vw]">
          <span className="hero-anim block text-white">LUXURY</span>
          <span className="hero-anim block text-stroke">STRENGTH</span>
          <span className="hero-anim block text-[#39ff14] neon-glow">SYSTEMS</span>
        </h1>
        <p className="hero-anim mt-8 max-w-xl text-sm leading-relaxed text-neutral-400 md:text-base">
          Commercial-grade equipment. 100% original imported supplements. Immersive
          3D facility design. AW GYMS builds world-class training environments —
          priced in Pakistani Rupees, delivered nationwide.
        </p>
        <div className="hero-anim mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#catalog"
            onClick={go("#catalog")}
            className="group bg-[#39ff14] px-8 py-4 font-mono2 text-xs font-semibold tracking-[0.25em] text-black transition-transform hover:scale-[1.04]"
            data-cursor="hover"
          >
            SHOP THE CATALOG
          </a>
          <a
            href="#showrooms"
            onClick={go("#showrooms")}
            className="border border-white/20 px-8 py-4 font-mono2 text-xs tracking-[0.25em] text-white transition-colors hover:border-[#39ff14] hover:text-[#39ff14]"
            data-cursor="hover"
          >
            ENTER 3D SHOWROOMS
          </a>
        </div>
      </div>

      {/* marquee */}
      <div className="relative z-10 mt-16 border-y border-white/5 bg-black/40 py-4">
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex shrink-0 items-center gap-10 whitespace-nowrap pr-10">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="flex items-center gap-10">
                {[
                  "COMMERCIAL EQUIPMENT",
                  "ORIGINAL SUPPLEMENTS",
                  "3D FACILITY DESIGN",
                  "NATIONWIDE DELIVERY",
                  "15-DAY ELITE COURSES",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-10">
                    <span className="font-display text-sm font-bold tracking-[0.3em] text-neutral-300">
                      {t}
                    </span>
                    <span className="text-[#39ff14]">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
