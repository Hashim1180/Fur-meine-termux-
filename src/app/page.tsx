"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSite, useAdmin } from "@/lib/store"
import { api } from "@/lib/api-client"

import Preloader from "@/components/shell/preloader"
import CinematicIntro from "@/components/shell/cinematic-intro"
import CustomCursor from "@/components/shell/custom-cursor"
import Overlays from "@/components/shell/overlays"
import AudioEngine from "@/components/shell/audio-engine"

import AnnouncementBar from "@/components/sections/announcement-bar"
import Header from "@/components/sections/header"
import Hero from "@/components/sections/hero"
import Manifesto from "@/components/sections/manifesto"
import Showroom from "@/components/sections/showroom"
import Catalog from "@/components/sections/catalog"
import Events from "@/components/sections/events"
import Footer from "@/components/sections/footer"

import AriaChat from "@/components/chat/aria-chat"
import CommandCenter from "@/components/admin/command-center"

/**
 * AW GYMS 2.0 — single-route immersive flagship.
 * State machine: preloader → intro → site (+ admin overlay + AI concierge).
 */
export default function Home() {
  const phase = useSite((s) => s.phase)
  const hydrateSettings = useSite((s) => s.hydrateSettings)
  const setCmdOpen = useAdmin((s) => s.setCmdOpen)
  const setOpen = useAdmin((s) => s.setOpen)

  // Hydrate live site settings (currency rates, whatsapp, brand, sketchfab, announcement)
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: api.settings })
  useEffect(() => {
    if (settings) {
      hydrateSettings({
        whatsapp: settings.whatsappNumber,
        rates: { usdRate: settings.usdRate, aedRate: settings.aedRate },
        announcement: settings.announcement,
        sketchfab: settings.sketchfabUrl,
        brand: settings.brandName,
        tagline: settings.brandTagline,
      })
    }
  }, [settings, hydrateSettings])

  // Open admin via ?admin=1 query (single-route constraint)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get("admin") === "1") {
      setOpen(true)
      setCmdOpen(true)
    }
  }, [setOpen, setCmdOpen])

  const onSite = phase === "site"

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--obsidian)]">
      {/* Immersive shell — always mounted */}
      <CustomCursor />
      <Overlays />
      <AudioEngine />

      {/* Phase gates */}
      {phase === "preloader" && <Preloader />}
      <CinematicIntro />

      {/* Site */}
      {onSite && (
        <div className="relative z-10 flex min-h-screen flex-col">
          <AnnouncementBar />
          <Header />
          <main id="top" className="flex-1">
            <Hero />
            <Manifesto />
            <Showroom />
            <Catalog />
            <Events />
          </main>
          <Footer />
        </div>
      )}

      {/* AI Sales Closer — visible once on site */}
      {onSite && <AriaChat />}

      {/* Admin Command Center — fullscreen overlay, triggered by ⌘K or ?admin=1 */}
      <CommandCenter />
    </div>
  )
}
