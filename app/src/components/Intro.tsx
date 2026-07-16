import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { blip, setSoundOn } from "@/audio/engine";

export function Intro({ onFinish }: { onFinish: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setLeaving(true);
    blip("success");
    // trigger ambient soundscape (user gesture or video end)
    setSoundOn(localStorage.getItem("aw_sound") === "on");
    const el = wrapRef.current;
    if (el) {
      gsap.to(el, {
        scale: 1.12,
        opacity: 0,
        duration: 1.1,
        ease: "power3.inOut",
        onComplete: onFinish,
      });
    } else {
      onFinish();
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnd = () => finish();
    v.addEventListener("ended", onEnd);
    void v.play().catch(() => {});
    // safety auto-skip after 75s
    const t = setTimeout(finish, 75000);
    return () => {
      v.removeEventListener("ended", onEnd);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} className="fixed inset-0 z-[105] bg-black">
      <video
        ref={videoRef}
        src="/assets/videos/intro.mp4"
        className="h-full w-full object-cover"
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
      <div className="absolute bottom-8 left-8">
        <p className="font-mono2 text-[10px] tracking-[0.4em] text-[#39ff14]">AW GYMS</p>
        <p className="font-display mt-1 text-xl font-bold tracking-tight text-white/90">
          THERE IS NO SHORTCUT.
        </p>
      </div>
      <button
        onClick={finish}
        disabled={leaving}
        className="group absolute bottom-8 right-8"
        data-cursor="hover"
      >
        <span className="relative block border border-white/25 px-8 py-3 transition-colors duration-500 group-hover:border-transparent">
          {/* path-drawing border on hover */}
          <span className="pointer-events-none absolute inset-0">
            <span className="absolute left-0 top-0 h-[1.5px] w-0 bg-[#39ff14] transition-all duration-300 group-hover:w-full" />
            <span className="absolute right-0 top-0 h-0 w-[1.5px] bg-[#39ff14] transition-all delay-150 duration-300 group-hover:h-full" />
            <span className="absolute bottom-0 right-0 h-[1.5px] w-0 bg-[#39ff14] transition-all delay-300 duration-300 group-hover:w-full" />
            <span className="absolute bottom-0 left-0 h-0 w-[1.5px] bg-[#39ff14] transition-all delay-500 duration-300 group-hover:h-full" />
          </span>
          <span className="font-mono2 text-xs tracking-[0.3em] text-white transition-colors group-hover:text-[#39ff14]">
            SKIP INTRO →
          </span>
        </span>
      </button>
    </div>
  );
}
