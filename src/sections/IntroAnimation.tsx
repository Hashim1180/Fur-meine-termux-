import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<"flip" | "cinematic" | "outro">("flip");
  const [flipIndex, setFlipIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const letters = ["A", "W", "", "G", "Y", "M", "S"];

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("cinematic");
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === "cinematic") {
      const timer = setTimeout(() => {
        setPhase("outro");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "outro") {
      const timer = setTimeout(() => {
        onComplete();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  useEffect(() => {
    if (phase === "flip") {
      const interval = setInterval(() => {
        setFlipIndex((prev) => {
          if (prev >= letters.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === "flip" && (
          <motion.div
            key="flip"
            className="relative flex items-center justify-center"
            exit={{ opacity: 0, scale: 1.5, transition: { duration: 0.8 } }}
          >
            <div className="flex gap-2 md:gap-4">
              {letters.map((letter, i) => (
                <motion.div
                  key={i}
                  initial={{ rotateY: 90, opacity: 0, scale: 0.5 }}
                  animate={
                    i <= flipIndex
                      ? {
                          rotateY: 0,
                          opacity: 1,
                          scale: 1,
                          transition: {
                            duration: 0.6,
                            ease: [0.34, 1.56, 0.64, 1],
                          },
                        }
                      : {}
                  }
                  className="relative"
                  style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
                >
                  {letter === "" ? (
                    <div className="w-4 md:w-8" />
                  ) : (
                    <div className="relative">
                      <span
                        className="text-6xl md:text-9xl font-orbitron font-black text-stroke"
                        style={{
                          textShadow:
                            "0 0 30px rgba(255,215,0,0.5), 0 0 60px rgba(255,215,0,0.3)",
                        }}
                      >
                        {letter}
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-yellow-400 via-orange-500 to-yellow-400"
                        initial={{ opacity: 0 }}
                        animate={
                          i <= flipIndex
                            ? { opacity: [0, 1, 0.3] }
                            : { opacity: 0 }
                        }
                        transition={{ duration: 0.4, delay: 0.2 }}
                        style={{
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        <span className="text-6xl md:text-9xl font-orbitron font-black">
                          {letter}
                        </span>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            <motion.div
              className="absolute bottom-20 left-0 right-0 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
            >
              <div className="h-px w-48 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
            </motion.div>
          </motion.div>
        )}

        {phase === "cinematic" && (
          <motion.div
            key="cinematic"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }
            }
          >
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              src="/assets/videos/video1.mp4"
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <motion.div
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                <h1
                  className="text-5xl md:text-8xl font-orbitron font-black tracking-wider"
                  style={{
                    background:
                      "linear-gradient(180deg, #FFD700 0%, #FFA500 40%, #FFD700 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "0 0 40px rgba(255,215,0,0.3)",
                  }}
                >
                  AW GYMS
                </h1>
                <motion.div
                  className="mt-4 h-px mx-auto"
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  transition={{ duration: 1.5, delay: 1 }}
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #FFD700, transparent)",
                  }}
                />
                <motion.p
                  className="mt-6 text-lg md:text-2xl font-rajdhani text-white/80 tracking-[0.3em] uppercase"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                >
                  The Future of Fitness
                </motion.p>
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute bottom-10 left-0 right-0 flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-8 h-1 bg-yellow-500/60 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {phase === "outro" && (
          <motion.div
            key="outro"
            className="absolute inset-0 flex items-center justify-center bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="text-center">
              <motion.h2
                className="text-4xl md:text-7xl font-orbitron font-bold text-white"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                Welcome to
              </motion.h2>
              <motion.h1
                className="text-6xl md:text-9xl font-orbitron font-black mt-2"
                initial={{ y: 100, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                style={{
                  background:
                    "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 30px rgba(255,215,0,0.4))",
                }}
              >
                AW GYMS
              </motion.h1>
              <motion.div
                className="mt-8 flex justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className="h-px w-24 bg-gradient-to-r from-transparent to-yellow-500" />
                <span className="text-yellow-500 text-sm tracking-[0.5em] uppercase font-rajdhani">
                  Enter
                </span>
                <div className="h-px w-24 bg-gradient-to-l from-transparent to-yellow-500" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
