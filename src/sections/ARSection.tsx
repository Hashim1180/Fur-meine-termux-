import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Glasses, Smartphone, Rotate3D, Box, Camera, Info } from "lucide-react";

const arModels = [
  {
    name: "Hex Dumbbell",
    usdz: "https://modelviewer.dev/shared-assets/models/Astronaut.usdz",
    glb: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    description: "View our premium hex dumbbell in your space using AR",
  },
  {
    name: "Bench Press",
    usdz: "https://modelviewer.dev/shared-assets/models/Astronaut.usdz",
    glb: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    description: "See how our Olympic bench press fits in your home gym",
  },
  {
    name: "Treadmill",
    usdz: "https://modelviewer.dev/shared-assets/models/Astronaut.usdz",
    glb: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    description: "Visualize the commercial treadmill in your space",
  },
];

export default function ARSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeModel, setActiveModel] = useState(0);

  return (
    <section
      ref={sectionRef}
      id="ar"
      className="relative bg-black py-24 md:py-40 overflow-hidden"
    >
      <div className="absolute inset-0">
        <video
          className="w-full h-full object-cover opacity-10"
          src="/assets/videos/video6.mp4"
          muted
          loop
          autoPlay
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="inline-block px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs tracking-[0.3em] uppercase font-rajdhani mb-6"
          >
            Augmented Reality
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6"
          >
            Try Before You{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Buy
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="max-w-xl mx-auto text-white/50 font-rajdhani"
          >
            Use your phone&apos;s camera to place gym equipment in your actual space.
            See the size, fit, and style before making a purchase.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {arModels.map((model, i) => (
              <button
                key={i}
                onClick={() => setActiveModel(i)}
                className={`w-full text-left p-6 rounded-2xl border transition-all ${
                  activeModel === i
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-white/5 border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activeModel === i
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <h3
                      className={`font-orbitron font-bold mb-1 ${
                        activeModel === i ? "text-yellow-400" : "text-white/70"
                      }`}
                    >
                      {model.name}
                    </h3>
                    <p className="text-sm text-white/40 font-rajdhani">
                      {model.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-5 h-5 text-yellow-500" />
                <h4 className="font-orbitron font-bold text-white text-sm">
                  How to use AR
                </h4>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Smartphone, text: "Tap the AR button below the model" },
                  { icon: Camera, text: "Point your camera at the floor/wall" },
                  { icon: Rotate3D, text: "Pinch to scale, drag to reposition" },
                  { icon: Glasses, text: "View in true scale in your space" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/50">
                    <step.icon className="w-4 h-4 text-yellow-500/60" />
                    <span className="font-rajdhani">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-gray-900 to-black aspect-square flex items-center justify-center">
              <model-viewer
                src={arModels[activeModel].glb}
                ios-src={arModels[activeModel].usdz}
                alt={`3D model of ${arModels[activeModel].name}`}
                camera-controls
                auto-rotate
                ar
                ar-modes="webxr scene-viewer quick-look"
                shadow-intensity="1"
                exposure="0.8"
                style={{ width: "100%", height: "100%" }}
              />
              <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur text-xs text-white/60 font-rajdhani border border-white/10">
                  Tap the AR icon to view in your space
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
      />
    </section>
  );
}
