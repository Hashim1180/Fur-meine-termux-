import { useState } from "react";
import { Link } from "react-router";
import { useStore } from "@/lib/store-context";
import { setSoundOn as engineSound, blip } from "@/audio/engine";
import type { Currency } from "@/lib/currency";

const NAV = [
  { label: "SHOWROOMS", href: "#showrooms" },
  { label: "CATALOG", href: "#catalog" },
  { label: "EVENTS", href: "#events" },
  { label: "CONTACT", href: "#contact" },
];

export function Header() {
  const {
    currency,
    setCurrency,
    sensory,
    setSensory,
    soundOn,
    setSoundOn,
    whatsappNumber,
    announcement,
  } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    engineSound(next);
    localStorage.setItem("aw_sound", next ? "on" : "off");
    if (next) blip("click");
  };

  const anchor = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    blip("click");
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {announcement && (
        <div className="fixed top-0 z-[100] w-full bg-[#39ff14] py-1 text-center">
          <span className="font-mono2 text-[10px] font-semibold tracking-[0.2em] text-black">
            {announcement.toUpperCase()}
          </span>
        </div>
      )}
      <header
        className={`fixed z-[99] w-full border-b border-white/5 bg-black/55 backdrop-blur-xl ${announcement ? "top-6" : "top-0"}`}
      >
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 md:px-10">
          <a
            href="#top"
            onClick={anchor("#top")}
            className="flex items-center gap-3"
            data-cursor="hover"
          >
            <span className="flex h-9 w-9 items-center justify-center border border-[#39ff14]/60 font-display text-lg font-black text-[#39ff14]">
              AW
            </span>
            <span className="font-display text-lg font-black tracking-[0.25em] text-white">
              GYMS
            </span>
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                onClick={anchor(n.href)}
                onMouseEnter={() => blip("hover")}
                className="font-mono2 text-[11px] tracking-[0.25em] text-neutral-400 transition-colors hover:text-[#39ff14]"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            {/* currency */}
            <div className="hidden items-center border border-white/10 sm:flex">
              {(["PKR", "USD", "AED"] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCurrency(c);
                    blip("click");
                  }}
                  className={`px-2.5 py-1.5 font-mono2 text-[10px] tracking-widest transition-colors ${
                    currency === c
                      ? "bg-[#39ff14] text-black"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* sound toggle */}
            <button
              onClick={toggleSound}
              title={sensory ? (soundOn ? "Sound off" : "Sound on") : "Sensory mode off"}
              disabled={!sensory}
              className={`flex h-9 w-9 items-end justify-center gap-[2.5px] border pb-2 transition-colors ${
                soundOn
                  ? "border-[#39ff14]/70 shadow-[0_0_14px_rgba(57,255,20,0.25)]"
                  : "border-white/10"
              } ${!sensory ? "opacity-30" : ""}`}
              data-cursor="hover"
            >
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`w-[2.5px] rounded-sm ${soundOn ? "bg-[#39ff14] wave-bar" : "bg-neutral-500"}`}
                  style={{
                    height: `${8 + i * 3}px`,
                    animationDelay: `${i * 0.12}s`,
                    animationPlayState: soundOn ? "running" : "paused",
                  }}
                />
              ))}
            </button>

            {/* sensory toggle */}
            <button
              onClick={() => {
                setSensory(!sensory);
                blip("click");
              }}
              title="Sensory mode (cursor, spotlight, audio)"
              className={`hidden h-9 items-center gap-2 border px-3 sm:flex ${
                sensory ? "border-[#39ff14]/50 text-[#39ff14]" : "border-white/10 text-neutral-500"
              }`}
              data-cursor="hover"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${sensory ? "bg-[#39ff14]" : "bg-neutral-600"}`}
              />
              <span className="font-mono2 text-[10px] tracking-[0.2em]">SENSORY</span>
            </button>

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 items-center bg-[#39ff14] px-4 font-mono2 text-[11px] font-semibold tracking-[0.15em] text-black transition-transform hover:scale-[1.03] md:flex"
              data-cursor="hover"
            >
              WHATSAPP
            </a>

            {/* mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 border border-white/10 lg:hidden"
              aria-label="Menu"
            >
              <span className={`h-px w-4 bg-white transition-transform ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`h-px w-4 bg-white transition-transform ${menuOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-white/5 bg-black/90 px-6 py-6 lg:hidden">
            <div className="flex flex-col gap-5">
              {NAV.map((n) => (
                <a
                  key={n.label}
                  href={n.href}
                  onClick={anchor(n.href)}
                  className="font-mono2 text-sm tracking-[0.3em] text-neutral-300"
                >
                  {n.label}
                </a>
              ))}
              <Link
                to="/admin"
                className="font-mono2 text-sm tracking-[0.3em] text-neutral-500"
                onClick={() => setMenuOpen(false)}
              >
                ADMIN
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
