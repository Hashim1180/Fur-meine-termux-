"use client"
import { useEffect, useRef } from "react"
import { useSite, useCursor } from "@/lib/store"

/**
 * AudioEngine — Web Audio soundscape.
 * Layers:
 *  - Sub-bass hum (two detuned sines ~55Hz + slow LFO gain)
 *  - Ambient pad (filtered noise + detuned triangle chord)
 *  - UI blips (sine envelope) on clicks; soft hover tick
 * Reactive:
 *  - scroll velocity deepens bass + speeds ambient LFO
 *  - sensory mode scales intensity
 * Gate: must start on a user gesture (browser autoplay policy).
 */
export default function AudioEngine() {
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const bassGainRef = useRef<GainNode | null>(null)
  const padGainRef = useRef<GainNode | null>(null)
  const startedRef = useRef(false)

  const startEngine = () => {
    if (startedRef.current) return
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext
      const ctx = new AC()
      ctxRef.current = ctx
      startedRef.current = true

      const master = ctx.createGain()
      master.gain.value = 0.0001
      master.connect(ctx.destination)
      masterRef.current = master

      // --- Sub-bass hum ---
      const bassGain = ctx.createGain()
      bassGain.gain.value = 0.18
      bassGain.connect(master)
      bassGainRef.current = bassGain

      const o1 = ctx.createOscillator()
      o1.type = "sine"
      o1.frequency.value = 55
      const o2 = ctx.createOscillator()
      o2.type = "sine"
      o2.frequency.value = 55.4
      o1.connect(bassGain)
      o2.connect(bassGain)
      o1.start()
      o2.start()

      // slow LFO on bass gain
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.08
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 0.08
      lfo.connect(lfoGain)
      lfoGain.connect(bassGain.gain)
      lfo.start()

      // --- Ambient pad: filtered noise + chord ---
      const padGain = ctx.createGain()
      padGain.gain.value = 0.05
      const padFilter = ctx.createBiquadFilter()
      padFilter.type = "lowpass"
      padFilter.frequency.value = 600
      padFilter.Q.value = 0.7
      padGain.connect(padFilter)
      padFilter.connect(master)
      padGainRef.current = padGain

      // chord (minor 7th-ish): A2 E3 A3 C4
      const freqs = [110, 164.81, 220, 261.63]
      for (const f of freqs) {
        const o = ctx.createOscillator()
        o.type = "triangle"
        o.frequency.value = f
        const g = ctx.createGain()
        g.gain.value = 0.25
        o.connect(g)
        g.connect(padGain)
        o.start()
      }

      // noise bed
      const bufferSize = 2 * ctx.sampleRate
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuffer
      noise.loop = true
      const noiseGain = ctx.createGain()
      noiseGain.gain.value = 0.015
      noise.connect(noiseGain)
      noiseGain.connect(padFilter)
      noise.start()

      // fade in master
      master.gain.setTargetAtTime(useSite.getState().soundOn ? (useSite.getState().sensory ? 0.85 : 0.45) : 0.0001, ctx.currentTime, 1.2)
    } catch (e) {
      console.warn("Audio engine failed", e)
    }
  }

  // Build the audio graph once
  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {})
    }
  }, [])

  // Subscribe to soundOn toggles
  useEffect(() => {
    const unsub = useSite.subscribe((s) => {
      if (s.soundOn && !startedRef.current) {
        startEngine()
      }
      if (masterRef.current && ctxRef.current) {
        const target = s.soundOn ? (s.sensory ? 0.85 : 0.45) : 0.0001
        masterRef.current.gain.setTargetAtTime(target, ctxRef.current.currentTime, 0.3)
      }
    })
    return unsub
  }, [])

  // scroll velocity → bass depth
  useEffect(() => {
    let lastV = 0
    const onScroll = () => {
      const v = useCursor.getState().velocity
      lastV = lastV * 0.8 + v * 0.2
      const ctx = ctxRef.current
      if (!ctx || !bassGainRef.current) return
      const sensory = useSite.getState().sensory
      const target = 0.12 + Math.min(0.4, lastV * 3) * (sensory ? 1 : 0.4)
      bassGainRef.current.gain.setTargetAtTime(target, ctx.currentTime, 0.25)
      // pad filter opens with velocity
      const padFilter = padGainRef.current?.["filter" as any] as any
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // UI blips on click
  useEffect(() => {
    const blip = (freq: number, dur: number, type: OscillatorType = "sine", vol = 0.05) => {
      const ctx = ctxRef.current
      if (!ctx || !startedRef.current || !useSite.getState().soundOn) return
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = freq
      const g = ctx.createGain()
      g.gain.value = 0
      o.connect(g)
      g.connect(masterRef.current!)
      const t = ctx.currentTime
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(vol, t + 0.005)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      o.start(t)
      o.stop(t + dur + 0.02)
    }
    const onDown = () => blip(880, 0.08, "triangle", 0.05)
    window.addEventListener("mousedown", onDown)
    return () => window.removeEventListener("mousedown", onDown)
  }, [])

  return null
}
