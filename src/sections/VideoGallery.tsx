import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";

const videos = [
  { id: 1, title: "Gym Motivation", src: "/assets/videos/video1.mp4", category: "Motivation" },
  { id: 2, title: "Workout Power", src: "/assets/videos/video2.mp4", category: "Training" },
  { id: 3, title: "Training Intensity", src: "/assets/videos/video3.mp4", category: "Training" },
  { id: 4, title: "Fitness Journey", src: "/assets/videos/video4.mp4", category: "Lifestyle" },
  { id: 5, title: "Strength Focus", src: "/assets/videos/video5.mp4", category: "Strength" },
  { id: 6, title: "Cardio Blast", src: "/assets/videos/video6.mp4", category: "Cardio" },
  { id: 7, title: "Gym Atmosphere", src: "/assets/videos/video7.mp4", category: "Lifestyle" },
  { id: 8, title: "Premium Experience", src: "/assets/videos/video8.mp4", category: "Premium" },
];

export default function VideoGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [muted, setMuted] = useState(true);
  const videoRefs = useRef<Record<number, HTMLVideoElement>>({});

  const togglePlay = (id: number) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (playingId === id) {
      video.pause();
      setPlayingId(null);
    } else {
      if (playingId !== null) {
        videoRefs.current[playingId]?.pause();
      }
      video.play();
      setPlayingId(id);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-black py-24 md:py-40 overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="inline-block px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs tracking-[0.3em] uppercase font-rajdhani mb-6"
          >
            Gallery
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6"
          >
            AW GYMS{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              in Motion
            </span>
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i }}
              className="group relative rounded-xl overflow-hidden bg-gray-900 aspect-[3/4]"
            >
              <video
                ref={(el) => {
                  if (el) videoRefs.current[video.id] = el;
                }}
                src={video.src}
                muted={muted}
                loop
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onClick={() => togglePlay(video.id)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => togglePlay(video.id)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    playingId === video.id
                      ? "bg-yellow-500/90 text-black"
                      : "bg-white/10 backdrop-blur text-white hover:bg-yellow-500/80 hover:text-black"
                  }`}
                >
                  {playingId === video.id ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </button>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-xs text-yellow-500 font-rajdhani uppercase tracking-wider mb-1">
                  {video.category}
                </div>
                <h3 className="text-sm font-orbitron font-bold text-white">
                  {video.title}
                </h3>
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-2 rounded-full bg-black/40 backdrop-blur text-white/60 hover:text-white transition-colors"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button className="p-2 rounded-full bg-black/40 backdrop-blur text-white/60 hover:text-white transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
