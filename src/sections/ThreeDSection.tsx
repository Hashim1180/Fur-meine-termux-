import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Box, ExternalLink, RotateCcw, Maximize2 } from "lucide-react";

const sketchfabModels = [
  {
    title: "Dumbbells PBR Optimized",
    embedUrl: "https://sketchfab.com/models/6e5a3e590d2f4314941c7c97cc500d62/embed",
    author: "Neske",
    category: "Equipment",
  },
  {
    title: "Dumbbell Model",
    embedUrl: "https://sketchfab.com/models/6f7b4ffa9fb8465dbd7a2356021fe8aa/embed",
    author: "donnichols",
    category: "Equipment",
  },
  {
    title: "Gym Environment",
    embedUrl: "https://sketchfab.com/models/fbd1baf5f56743e6bd4299ad91473b9a/embed",
    author: "Zeps3D",
    category: "Environment",
  },
  {
    title: "Gym Dumbell Set",
    embedUrl: "https://sketchfab.com/models/88fe5a1444c045d1b0bd88dd4dcfe79b/embed",
    author: "Sousinho",
    category: "Equipment",
  },
];

export default function ThreeDSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeModel, setActiveModel] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <section
      ref={sectionRef}
      id="models"
      className="relative bg-black py-24 md:py-40 overflow-hidden"
    >
      <div className="absolute inset-0">
        <video
          className="w-full h-full object-cover opacity-15"
          src="/assets/videos/video4.mp4"
          muted
          loop
          autoPlay
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="inline-block px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs tracking-[0.3em] uppercase font-rajdhani mb-6"
          >
            Interactive 3D
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6"
          >
            Explore in{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              3D
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="max-w-xl mx-auto text-white/50 font-rajdhani"
          >
            Interact with our equipment models in full 3D. Rotate, zoom, and examine 
            every detail before you buy.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {sketchfabModels.map((model, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.1 * i }}
                onClick={() => setActiveModel(i)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeModel === i
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-white/5 border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Box className={`w-5 h-5 ${activeModel === i ? "text-yellow-500" : "text-white/40"}`} />
                  <div>
                    <div className={`font-orbitron font-bold text-sm ${activeModel === i ? "text-yellow-400" : "text-white/70"}`}>
                      {model.title}
                    </div>
                    <div className="text-xs text-white/40 font-rajdhani">
                      by {model.author} &bull; {model.category}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3 }}
            className={`lg:col-span-2 relative rounded-2xl overflow-hidden border border-white/10 bg-black ${
              isFullscreen ? "fixed inset-4 z-50" : "aspect-video"
            }`}
          >
            <iframe
              title={sketchfabModels[activeModel].title}
              className="w-full h-full"
              src={sketchfabModels[activeModel].embedUrl}
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen; xr-spatial-tracking"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setActiveModel((prev) => (prev + 1) % sketchfabModels.length)}
                className="p-2 rounded-lg bg-black/60 backdrop-blur text-white/60 hover:text-yellow-400 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg bg-black/60 backdrop-blur text-white/60 hover:text-yellow-400 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <a
                href={sketchfabModels[activeModel].embedUrl.replace("/embed", "")}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-black/60 backdrop-blur text-white/60 hover:text-yellow-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-xs text-white/60 font-rajdhani">
              Powered by Sketchfab
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
