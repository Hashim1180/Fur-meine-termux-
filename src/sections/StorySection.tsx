import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TrendingUp, Target, Zap, Award, Users, Clock } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Users, value: "5,000+", label: "Active Members" },
  { icon: TrendingUp, value: "50K+", label: "Transformations" },
  { icon: Award, value: "25", label: "Expert Trainers" },
  { icon: Clock, value: "24/7", label: "Open Access" },
];

const features = [
  {
    icon: Target,
    title: "Precision Training",
    desc: "Data-driven workout programs tailored to your biomechanics and goals.",
  },
  {
    icon: Zap,
    title: "Elite Equipment",
    desc: "Commercial-grade Hammer Strength, Rogue, and Technogym machinery.",
  },
  {
    icon: Award,
    title: "Certified Coaches",
    desc: "NSCA, ACE, and NASM certified personal trainers at your service.",
  },
];

export default function StorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".story-card", {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });

      gsap.from(".stat-item", {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative bg-black py-24 md:py-40 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <video
          className="w-full h-full object-cover"
          src="/assets/videos/video3.mp4"
          muted
          loop
          autoPlay
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs tracking-[0.3em] uppercase font-rajdhani mb-6"
          >
            Our Story
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6"
          >
            Built for{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Champions
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto text-lg text-white/60 font-rajdhani"
          >
            AW GYMS is Pakistan&apos;s premier fitness destination, offering state-of-the-art 
            equipment, expert trainers, and an unmatched atmosphere for your fitness journey. 
            From beginners to professional athletes, we provide the tools and guidance to unlock 
            your full potential.
          </motion.p>
        </div>

        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-24">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="stat-item glass rounded-2xl p-6 md:p-8 text-center group hover:border-yellow-500/30 transition-all"
            >
              <stat.icon className="w-8 h-8 text-yellow-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <div className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-white/50 font-rajdhani uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div ref={featuresRef} className="grid md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="story-card glass rounded-2xl p-8 group hover:bg-white/5 transition-all duration-500"
              whileHover={{ y: -5 }}
            >
              <div className="w-14 h-14 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6 group-hover:bg-yellow-500/20 transition-colors">
                <feature.icon className="w-7 h-7 text-yellow-500" />
              </div>
              <h3 className="text-xl font-orbitron font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-white/50 font-rajdhani leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
