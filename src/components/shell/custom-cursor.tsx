"use client"
import { useEffect, useRef } from "react"
import { useCursor, useSite } from "@/lib/store"

/**
 * Custom cinematic cursor + mouse spotlight canvas + click ripples.
 * - A radial spotlight follows the cursor (only in sensory mode).
 * - DOM ring + dot, blends difference for visibility over any bg.
 * - Clicks emit liquid ripples on the canvas.
 * - Mousemove velocity feeds the audio engine + chromatic aberration.
 */
export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ripples = useRef<{ x: number; y: number; r: number; a: number; hue: number }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", onResize)

    let lastT = performance.now()
    let lastX = 0, lastY = 0
    let smoothX = 0, smoothY = 0
    let targetX = 0, targetY = 0

    const onMove = (e: MouseEvent) => {
      const now = performance.now()
      const dt = Math.max(1, now - lastT)
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      const v = Math.min(1, (Math.hypot(dx, dy) / dt) * 0.05)
      useCursor.getState().set({ x: e.clientX, y: e.clientY, velocity: v })
      targetX = e.clientX
      targetY = e.clientY
      // variant detection
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
      if (el?.closest("[data-cursor='drag']")) useCursor.getState().set({ variant: "drag" })
      else if (el?.closest("a,button,[data-cursor='link']")) useCursor.getState().set({ variant: "link" })
      else if (el?.closest("input,textarea,[contenteditable='true']")) useCursor.getState().set({ variant: "text" })
      else useCursor.getState().set({ variant: "default" })
      lastX = e.clientX
      lastY = e.clientY
      lastT = now
    }

    const onDown = (e: MouseEvent) => {
      useCursor.getState().set({ pressed: true })
      ripples.current.push({ x: e.clientX, y: e.clientY, r: 0, a: 0.5, hue: Math.random() > 0.5 ? 130 : 80 })
    }
    const onUp = () => useCursor.getState().set({ pressed: false })

    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("mousedown", onDown)
    window.addEventListener("mouseup", onUp)

    let raf = 0
    const render = () => {
      smoothX += (targetX - smoothX) * 0.18
      smoothY += (targetY - smoothY) * 0.18

      const st = useCursor.getState()
      const sensory = useSite.getState().sensory
      const onSite = useSite.getState().phase === "site" || useSite.getState().phase === "admin"

      ctx.clearRect(0, 0, w, h)

      if (sensory && onSite) {
        // spotlight
        const g = ctx.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, 380)
        g.addColorStop(0, "rgba(198,255,61,0.10)")
        g.addColorStop(0.4, "rgba(198,255,61,0.04)")
        g.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }

      // ripples
      ripples.current = ripples.current.filter((rp) => rp.a > 0.01)
      for (const rp of ripples.current) {
        rp.r += 6
        rp.a *= 0.93
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(${rp.hue}, 90%, 60%, ${rp.a})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // DOM cursor
      if (ringRef.current && dotRef.current) {
        const scale = st.pressed ? 0.6 : st.variant === "drag" ? 1.6 : st.variant === "link" ? 1.25 : 1
        ringRef.current.style.transform = `translate3d(${smoothX}px, ${smoothY}px, 0) translate(-50%, -50%) scale(${scale})`
        ringRef.current.style.opacity = onSite ? "1" : "0"
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`
        dotRef.current.style.opacity = onSite ? "1" : "0"
        ringRef.current.style.borderColor =
          st.variant === "link" ? "var(--neon)" : st.variant === "drag" ? "var(--gold)" : "rgba(255,255,255,0.7)"
      }

      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    // hide on touch / small screens
    const isTouch = window.matchMedia("(hover: none)").matches
    if (isTouch) {
      document.body.classList.remove("cursor-none")
    } else {
      document.body.classList.add("cursor-none")
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mouseup", onUp)
      document.body.classList.remove("cursor-none")
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[60]" aria-hidden />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[61] h-8 w-8 rounded-full border transition-[transform,border-color] duration-150 ease-out"
        style={{ mixBlendMode: "difference" }}
        aria-hidden
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[61] h-1.5 w-1.5 rounded-full bg-white"
        style={{ mixBlendMode: "difference" }}
        aria-hidden
      />
    </>
  )
}
