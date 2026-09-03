import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { blip } from "@/audio/engine";

gsap.registerPlugin(ScrollTrigger);

const SHOWROOMS = [
  {
    id: "01",
    title: "THE AW ELITE VIRTUAL GYM TOUR",
    desc: "Walk the full facility — strength floor, cardio deck, recovery lounge. Drag anywhere to look around.",
    src: "https://sketchfab.com/models/b3211ce8d0804f58b5a25dc7f95e3439/embed?autostart=1&scrollwheel=0",
  },
  {
    id: "02",
    title: "AW STRENGTH STATION — CONFIG A",
    desc: "Plate-loaded strength cluster configured for a commercial corner unit. Rotate to inspect every weld.",
    src: "https://sketchfab.com/models/14a4a06784d9429085b19135af75db25/embed?autostart=1&scrollwheel=0",
  },
  {
    id: "03",
    title: "AW COMMERCIAL FACILITY BLUEPRINT",
    desc: "Complete commercial gym floor plan in interactive 3D — zoning, flow, sightlines and spacing.",
    src: "https://sketchfab.com/models/906a1f19b4da403893ef70ad09c4df71/embed?autostart=1&scrollwheel=0",
  },
  {
    id: "04",
    title: "AW STRENGTH STATION — CONFIG B",
    desc: "Alternate rack-and-station arrangement for boutique studios and premium home gyms.",
    src: "https://sketchfab.com/models/14a4a06784d9429085b19135af75db25/embed?autostart=1&scrollwheel=0",
  },
];

export function Showrooms() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".sr-reveal").forEach((el) => {
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
    <section id="showrooms" ref={root} className="relative z-10 border-t border-white/5 bg-[#0c0c0c] py-28 md:py-36">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="sr-reveal font-mono2 text-[10px] tracking-[0.5em] text-[#39ff14]">
              INTERACTIVE 3D SHOWROOMS
            </p>
            <h2 className="sr-reveal font-display mt-4 text-4xl font-black tracking-tight text-white md:text-6xl">
              WALK THE FLOOR
              <br />
              <span className="text-stroke">BEFORE IT EXISTS</span>
            </h2>
          </div>
          <p className="sr-reveal max-w-sm text-sm leading-relaxed text-neutral-500">
            Four live 3D environments. Drag to rotate, scroll page to continue.
            Every AW facility starts here — then we build it for real.
          </p>
        </div>

        {/* selector */}
        <div className="sr-reveal mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {SHOWROOMS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setActive(i);
                setLoaded(false);
                blip("click");
              }}
              className={`group bg-[#0c0c0c] p-5 text-left transition-colors ${
                active === i ? "bg-[#111] shadow-[inset_0_2px_0_#39ff14]" : "hover:bg-[#101010]"
              }`}
              data-cursor="hover"
            >
              <span className={`font-mono2 text-[10px] tracking-[0.3em] ${active === i ? "text-[#39ff14]" : "text-neutral-600"}`}>
                SHOWROOM {s.id}
              </span>
              <span className={`font-display mt-2 block text-sm font-bold tracking-wide ${active === i ? "text-white" : "text-neutral-400"}`}>
                {s.title}
              </span>
            </button>
          ))}
        </div>

        {/* viewport */}
        <div className="sr-reveal relative mt-8 overflow-hidden border border-white/10 showroom-frame">
          {!loaded && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0c0c0c]">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#39ff14]" />
                <span className="font-mono2 text-[10px] tracking-[0.3em] text-neutral-500">
                  LOADING SHOWROOM {SHOWROOMS[active].id}
                </span>
              </div>
            </div>
          )}
          <div className="relative aspect-[16/10] w-full md:aspect-[21/9]" data-cursor="drag">
            <iframe
              key={active}
              title={SHOWROOMS[active].title}
              src={SHOWROOMS[active].src}
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen; xr-spatial-tracking"
              onLoad={() => setLoaded(true)}
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
            <p className="font-display text-sm font-bold tracking-wide text-white">
              {SHOWROOMS[active].title}
            </p>
            <p className="max-w-md text-xs leading-relaxed text-neutral-500">
              {SHOWROOMS[active].desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
