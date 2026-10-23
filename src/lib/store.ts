"use client"
import { create } from "zustand"

interface SiteState {
  phase: "preloader" | "intro" | "site" | "admin"
  sensory: boolean // full sensory mode (audio + heavy effects)
  soundOn: boolean
  currency: "PKR" | "USD" | "AED"
  rates: { usdRate: number; aedRate: number }
  whatsapp: string
  brand: string
  tagline: string
  sketchfab: string
  announcement: string
  setPhase: (p: SiteState["phase"]) => void
  setSensory: (v: boolean) => void
  setSoundOn: (v: boolean) => void
  toggleSound: () => void
  setCurrency: (c: SiteState["currency"]) => void
  hydrateSettings: (s: Partial<SiteState>) => void
}

export const useSite = create<SiteState>((set) => ({
  phase: "preloader",
  sensory: true,
  soundOn: false,
  currency: "PKR",
  rates: { usdRate: 278, aedRate: 75.6 },
  whatsapp: "+923497814918",
  brand: "AW GYMS",
  tagline: "THERE IS NO SHORTCUT",
  sketchfab: "https://sketchfab.com/models/fbd1baf5f56743e6bd4299ad91473b9a/embed",
  announcement: "",
  setPhase: (p) => set({ phase: p }),
  setSensory: (v) => set({ sensory: v }),
  setSoundOn: (v) => set({ soundOn: v }),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  setCurrency: (c) => set({ currency: c }),
  hydrateSettings: (s) => set(s),
}))

interface AdminState {
  authed: boolean
  open: boolean
  cmdOpen: boolean
  view: "telemetry" | "products" | "events" | "media" | "settings"
  setAuthed: (v: boolean) => void
  setOpen: (v: boolean) => void
  setCmdOpen: (v: boolean) => void
  setView: (v: AdminState["view"]) => void
}

export const useAdmin = create<AdminState>((set) => ({
  authed: false,
  open: false,
  cmdOpen: false,
  view: "telemetry",
  setAuthed: (v) => set({ authed: v }),
  setOpen: (v) => set({ open: v }),
  setCmdOpen: (v) => set({ cmdOpen: v }),
  setView: (v) => set({ view: v }),
}))

interface CursorState {
  x: number
  y: number
  pressed: boolean
  variant: "default" | "drag" | "link" | "text" | "hidden"
  velocity: number
  set: (p: Partial<CursorState>) => void
}

export const useCursor = create<CursorState>((set) => ({
  x: 0,
  y: 0,
  pressed: false,
  variant: "default",
  velocity: 0,
  set: (p) => set(p),
}))
