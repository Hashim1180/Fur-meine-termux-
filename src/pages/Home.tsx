import { useEffect, useState } from "react";
import Lenis from "lenis";
import { StoreProvider, useStore } from "@/lib/store-context";
import { Preloader } from "@/components/Preloader";
import { Intro } from "@/components/Intro";
import { Cursor } from "@/components/Cursor";
import { Spotlight } from "@/components/Spotlight";
import { ChatWidget } from "@/components/ChatWidget";
import { Header } from "@/sections/Header";
import { Hero } from "@/sections/Hero";
import { Manifesto } from "@/sections/Manifesto";
import { Showrooms } from "@/sections/Showrooms";
import { Catalog } from "@/sections/Catalog";
import { Events } from "@/sections/Events";
import { Footer } from "@/sections/Footer";

type Stage = "preload" | "intro" | "site";

function ScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById("aw-progress");
    if (!bar) return;
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      bar.style.width = `${pct}%`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div id="aw-progress" className="progress-bar" />;
}

function Site() {
  const [stage, setStage] = useState<Stage>("preload");
  const { setIntroDone, sensory } = useStore();

  // Lenis smooth scroll
  useEffect(() => {
    if (stage !== "site") return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // anchor links through lenis
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (id && id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el as HTMLElement, { offset: -70 });
        }
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      document.removeEventListener("click", onClick);
    };
  }, [stage]);

  // lock scroll during preload/intro
  useEffect(() => {
    document.body.style.overflow = stage === "site" ? "" : "hidden";
  }, [stage]);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* film grain */}
      {sensory && <div className="grain-overlay" />}
      <Spotlight />
      <Cursor />
      <ScrollProgress />

      {stage === "preload" && <Preloader onDone={() => setStage("intro")} />}
      {stage === "intro" && (
        <Intro
          onFinish={() => {
            setStage("site");
            setIntroDone(true);
          }}
        />
      )}

      <Header />
      <main className={stage === "site" ? "" : "pointer-events-none opacity-0"}>
        <Hero active={stage === "site"} />
        <Manifesto />
        <Showrooms />
        <Catalog
          onOrder={(p) => {
            window.dispatchEvent(new CustomEvent("aw:order", { detail: p.name }));
          }}
        />
        <Events />
        <Footer />
      </main>
      {stage === "site" && <ChatWidget />}
    </div>
  );
}

export default function Home() {
  return (
    <StoreProvider>
      <Site />
    </StoreProvider>
  );
}
