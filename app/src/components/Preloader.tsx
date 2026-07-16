import { useEffect, useState } from "react";

export function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // simulate biometric asset scan with real-ish easing
    let p = 0;
    const tick = () => {
      p += Math.random() * 9 + 3;
      if (p >= 100) {
        setProgress(100);
        setTimeout(onDone, 450);
        return;
      }
      setProgress(Math.floor(p));
      setTimeout(tick, 120 + Math.random() * 140);
    };
    const t = setTimeout(tick, 200);
    return () => clearTimeout(t);
  }, [onDone]);

  const R = 64;
  const C = 2 * Math.PI * R;

  return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-[#0a0a0a]">
      <div className="relative h-44 w-44">
        {/* outer rotating dashed ring */}
        <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full scan-sweep">
          <circle
            cx="80"
            cy="80"
            r="74"
            fill="none"
            stroke="rgba(57,255,20,0.25)"
            strokeWidth="1"
            strokeDasharray="4 10"
          />
        </svg>
        {/* progress ring */}
        <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="80" cy="80" r={R} fill="none" stroke="#1d1d1d" strokeWidth="3" />
          <circle
            cx="80"
            cy="80"
            r={R}
            fill="none"
            stroke="#39ff14"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C - (C * progress) / 100}
            style={{ filter: "drop-shadow(0 0 6px rgba(57,255,20,0.6))", transition: "stroke-dashoffset 0.2s" }}
          />
        </svg>
        {/* core */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-black tracking-tight text-white">
            {progress}
            <span className="text-[#39ff14]">%</span>
          </span>
          <span className="font-mono2 mt-1 text-[9px] tracking-[0.3em] text-neutral-500">
            BIOMETRIC SCAN
          </span>
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <span className="font-mono2 blink-soft text-[10px] tracking-[0.35em] text-[#39ff14]">
          CALIBRATING ASSETS
        </span>
        <span className="font-mono2 text-[10px] tracking-[0.2em] text-neutral-600">
          AW GYMS // LUXURY STRENGTH SYSTEMS
        </span>
      </div>
    </div>
  );
}
