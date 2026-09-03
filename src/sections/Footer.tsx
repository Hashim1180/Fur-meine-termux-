import { useStore, useFormat } from "@/lib/store-context";
import { blip } from "@/audio/engine";
import { Link } from "react-router";

export function Footer() {
  const { whatsappNumber } = useStore();
  const fmt = useFormat();

  return (
    <footer id="contact" className="relative z-10 border-t border-white/5">
      {/* CTA band */}
      <div className="relative overflow-hidden">
        <video
          src="/assets/videos/equipment-showcase.mp4"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]" />
        <div className="relative mx-auto max-w-[1500px] px-5 py-24 text-center md:px-10 md:py-32">
          <p className="font-mono2 text-[10px] tracking-[0.5em] text-[#39ff14]">
            READY WHEN YOU ARE
          </p>
          <h2 className="font-display mx-auto mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-white md:text-6xl">
            LET'S BUILD YOUR
            <span className="text-[#39ff14]"> LEGACY</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-neutral-400">
            Talk to a senior AW closer on WhatsApp right now — equipment quotes in PKR,
            supplement stacks, facility design, or course bookings.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Assalam-o-Alaikum AW GYMS! I'm ready to talk business. (awgyms.com)")}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => blip("success")}
            className="mt-10 inline-flex items-center gap-3 bg-[#39ff14] px-10 py-5 font-mono2 text-xs font-bold tracking-[0.25em] text-black transition-transform hover:scale-105"
            data-cursor="hover"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.03c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.13-1.47-.72-1.69-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.38-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29z" />
            </svg>
            +92 349 7814918
          </a>
        </div>
      </div>

      {/* meta */}
      <div className="border-t border-white/5 bg-black/60">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 md:grid-cols-4 md:px-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center border border-[#39ff14]/60 font-display text-lg font-black text-[#39ff14]">
                AW
              </span>
              <span className="font-display text-lg font-black tracking-[0.25em] text-white">GYMS</span>
            </div>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-neutral-500">
              Pakistan's luxury strength brand. Commercial equipment, original
              supplements, immersive 3D facility design and elite coaching.
            </p>
          </div>
          <div>
            <p className="font-mono2 text-[10px] tracking-[0.3em] text-neutral-600">NAVIGATE</p>
            <ul className="mt-4 space-y-2.5 text-xs text-neutral-400">
              <li><a href="#showrooms" className="hover:text-[#39ff14]">3D Showrooms</a></li>
              <li><a href="#catalog" className="hover:text-[#39ff14]">Catalog</a></li>
              <li><a href="#events" className="hover:text-[#39ff14]">Events & Courses</a></li>
              <li><Link to="/admin" className="hover:text-[#39ff14]">Admin Console</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-mono2 text-[10px] tracking-[0.3em] text-neutral-600">FLAGSHIP</p>
            <ul className="mt-4 space-y-2.5 text-xs text-neutral-400">
              <li>Lahore, Pakistan</li>
              <li>Open 6:00 — 24:00, 7 days</li>
              <li>Nationwide delivery & install</li>
              <li>Karachi · Islamabad · Lahore</li>
            </ul>
          </div>
          <div>
            <p className="font-mono2 text-[10px] tracking-[0.3em] text-neutral-600">CONTACT</p>
            <ul className="mt-4 space-y-2.5 text-xs text-neutral-400">
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#39ff14] hover:underline"
                >
                  WhatsApp: +92 349 7814918
                </a>
              </li>
              <li>COD · Bank Transfer · EasyPaisa</li>
              <li>Free delivery over {fmt(50000)}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 py-5 text-center">
          <p className="font-mono2 text-[9px] tracking-[0.3em] text-neutral-700">
            © 2026 AW GYMS — LUXURY STRENGTH SYSTEMS · AWGYMS.COM
          </p>
        </div>
      </div>
    </footer>
  );
}
