"use client"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSite } from "@/lib/store"

/**
 * Reality-distortion preloader — "The Awakening".
 * Pitch-black void, floating dust particles reacting to mouse, a wireframe
 * skeletal/biomechanical structure assembling itself, sub-bass biometric pulse,
 * then a violent snap-to-focus unlock.
 */
export default function Preloader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const setPhase = useSite((s) => s.setPhase)

  useEffect(() => {
    const c = canvasRef.current!
    const ctx = c.getContext("2d")!
    let w = (c.width = window.innerWidth)
    let h = (c.height = window.innerHeight)
    const onResize = () => {
      w = c.width = window.innerWidth
      h = c.height = window.innerHeight
    }
    window.addEventListener("resize", onResize)

    // dust particles
    const N = window.innerWidth < 768 ? 90 : 180
    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 1 + 0.2,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.4 + 0.2,
    }))

    let mouse = { x: w / 2, y: h / 2 }
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener("mousemove", onMove)

    const cx = () => w / 2
    const cy = () => h / 2
    let t = 0
    let raf = 0

    const draw = () => {
      t += 0.016
      ctx.clearRect(0, 0, w, h)

      // assembling wireframe structure (torus of nodes pulsing inward)
      const ringR = 120 + Math.sin(t * 0.6) * 18
      const nodes = 18
      const open = Math.min(1, progress / 80) // 0..1 assembly
      for (let i = 0; i < nodes; i++) {
        const a = (i / nodes) * Math.PI * 2 + t * 0.2
        const rr = ringR * (0.6 + open * 0.4)
        const x = cx() + Math.cos(a) * rr
        const y = cy() + Math.sin(a) * rr * 0.55
        const x2 = cx() + Math.cos(a + 0.34) * rr
        const y2 = cy() + Math.sin(a + 0.34) * rr * 0.55
        ctx.strokeStyle = `rgba(198,255,61,${0.15 + open * 0.25})`
        ctx.lineWidth = 0.6
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(198,255,61,${0.4 + open * 0.5})`
        ctx.fill()
      }
      // inner pulse ring
      const pulse = 6 + Math.abs(Math.sin(t * 3)) * 18
      ctx.beginPath()
      ctx.arc(cx(), cy(), pulse, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,61,92,${0.5})`
      ctx.lineWidth = 1
      ctx.stroke()

      // dust + mouse attraction
      for (const p of parts) {
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const d2 = dx * dx + dy * dy
        if (d2 < 30000) {
          p.vx += (dx / d2) * 6
          p.vy += (dy / d2) * 6
        }
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy *= 0.96
        if (p.x < 0) p.x += w
        if (p.x > w) p.x -= w
        if (p.y < 0) p.y += h
        if (p.y > h) p.y -= h
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,220,230,${0.15 + p.z * 0.25})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    // progress timeline — accumulate in a ref so it survives re-renders
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 6 + 2
      if (p >= 100) {
        p = 100
        clearInterval(iv)
        setProgress(100)
        setTimeout(() => setDone(true), 350)
        return
      }
      setProgress(Math.floor(p))
    }, 110)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(iv)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("mousemove", onMove)
    }
  }, [])

  const exit = () => {
    setPhase("intro")
  }

  useEffect(() => {
    if (done) {
      const id = setTimeout(exit, 300)
      return () => clearTimeout(id)
    }
  }, [done])

  return (
    <AnimatePresence onExitComplete={exit}>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--obsidian)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 0.5 }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.div
              className="font-mono text-[10px] tracking-mega text-[var(--neon)]/70"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              BIOMETRIC HANDSHAKE
            </motion.div>
            <div className="font-display text-4xl font-black tracking-cinema text-white sm:text-6xl">
              AW <span className="text-gradient-neon">GYMS</span>
            </div>
            <div className="font-mono text-[10px] tracking-wide-2 text-white/40">
              CALIBRATING NEURAL INTERFACE
            </div>
            <div className="h-px w-56 overflow-hidden bg-white/10 sm:w-72">
              <motion.div
                className="h-full bg-[var(--neon)]"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.2 }}
              />
            </div>
            <div className="font-mono text-[11px] text-white/50 tabular-nums">{progress}%</div>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-wide-2 text-white/30">
            v2.0 · IMMERSIVE FLAGSHIP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
