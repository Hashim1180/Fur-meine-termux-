"use client"
import { useEffect, useRef } from "react"
import { useCursor } from "@/lib/store"

/**
 * Full-viewport film grain + chromatic aberration + scanline overlay.
 * Chromatic aberration intensity spikes with cursor velocity (glitch matrix).
 */
export default function Overlays() {
  const grainRef = useRef<HTMLCanvasElement>(null)
  const abRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Grain — animated noise canvas
    const c = grainRef.current!
    const ctx = c.getContext("2d")!
    const size = 180
    c.width = size
    c.height = size
    let raf = 0
    const draw = () => {
      const img = ctx.createImageData(size, size)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0
        d[i] = d[i + 1] = d[i + 2] = v
        d[i + 3] = 255
      }
      ctx.putImageData(img, 0, 0)
      raf = requestAnimationFrame(draw)
    }
    draw()

    // Chromatic aberration via transform of duplicated layers — driven by velocity
    let cur = 0
    const tick = () => {
      const v = useCursor.getState().velocity
      cur += (v - cur) * 0.1
      if (abRef.current) {
        const intensity = Math.min(1, cur * 2)
        abRef.current.style.opacity = String(intensity * 0.7)
        abRef.current.style.transform = `translate(${intensity * 3}px, ${intensity * 2}px)`
      }
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[55]" aria-hidden>
      {/* film grain */}
      <canvas
        ref={grainRef}
        className="absolute inset-0 h-full w-full opacity-[0.06] mix-blend-overlay"
        style={{ imageRendering: "pixelated" }}
      />
      {/* chromatic aberration overlay (rgb split) */}
      <div
        ref={abRef}
        className="absolute inset-0 opacity-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,0,80,0.18) 0%, transparent 4%, transparent 96%, rgba(0,200,255,0.18) 100%)",
          mixBlendMode: "screen",
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)" }}
      />
      {/* subtle scanlines */}
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-multiply"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 3px)",
        }}
      />
    </div>
  )
}
