import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store-context";

export function Spotlight() {
  const { sensory } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!sensory) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const mouse = { x: w / 2, y: h * 0.35 };
    const smooth = { x: mouse.x, y: mouse.y };

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    let raf = 0;
    const draw = () => {
      smooth.x += (mouse.x - smooth.x) * 0.08;
      smooth.y += (mouse.y - smooth.y) * 0.08;
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(
        smooth.x,
        smooth.y,
        0,
        smooth.x,
        smooth.y,
        Math.max(w, h) * 0.45,
      );
      g.addColorStop(0, "rgba(57, 255, 20, 0.045)");
      g.addColorStop(0.35, "rgba(160, 160, 160, 0.035)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      raf = requestAnimationFrame(draw);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [sensory]);

  if (!sensory) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[2]"
      aria-hidden
    />
  );
}
