import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store-context";

export function Cursor() {
  const { sensory } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (!sensory) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      const t = e.target as HTMLElement | null;
      const drag = t?.closest?.("[data-cursor='drag']");
      const link = t?.closest?.("a, button, [data-cursor='hover'], input, textarea, select, [role='button']");
      el.classList.toggle("drag", !!drag);
      el.classList.toggle("hovering", !drag && !!link);
    };
    let raf = 0;
    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.16;
      pos.current.y += (target.current.y - pos.current.y) * 0.16;
      el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [sensory]);

  if (!sensory) return null;

  return (
    <div ref={ref} className="aw-cursor hidden md:block">
      <div className="aw-cursor-ring">
        <span className="aw-cursor-label">
          DRAG
          <br />
          TO ROTATE
        </span>
      </div>
    </div>
  );
}
