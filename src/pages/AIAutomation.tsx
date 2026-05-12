import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Brain,
  Bot,
  TrendingUp,
  Shield,
  Zap,
  Cpu,
  Network,
  ArrowLeft,
  Sparkles,
  Target,
  Clock,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router";

const features = [
  {
    icon: Brain,
    title: "Neural Sales Engine",
    description:
      "Our AI analyzes customer behavior patterns to optimize sales funnels and predict purchasing decisions in real-time.",
    color: "yellow",
  },
  {
    icon: Bot,
    title: "24/7 AI Chatbot",
    description:
      "Intelligent conversational AI handles inquiries, books appointments, and drives sales to WhatsApp automatically.",
    color: "green",
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description:
      "Machine learning models forecast demand, optimize inventory, and identify high-value customer segments.",
    color: "blue",
  },
  {
    icon: Shield,
    title: "Smart Security",
    description:
      "AI-powered fraud detection and anomaly monitoring protect your business and customer data around the clock.",
    color: "red",
  },
  {
    icon: Zap,
    title: "Auto-Scaling",
    description:
      "Infrastructure automatically scales based on traffic patterns, ensuring 99.9% uptime during peak hours.",
    color: "orange",
  },
  {
    icon: Network,
    title: "Connected Ecosystem",
    description:
      "Seamlessly integrates with WhatsApp, email, SMS, and social media for unified customer communication.",
    color: "purple",
  },
];

const stats = [
  { icon: Target, value: "99.9%", label: "Uptime SLA" },
  { icon: Clock, value: "<1s", label: "Response Time" },
  { icon: BarChart3, value: "10K+", label: "Daily Interactions" },
  { icon: Cpu, value: "GPT-4", label: "AI Model" },
];

export default function AIAutomationPage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="relative py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0">
          <video
            className="w-full h-full object-cover opacity-10"
            src="/assets/videos/video1.mp4"
            muted
            loop
            autoPlay
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-yellow-400 transition-colors mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-rajdhani">Back to AW GYMS</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs tracking-[0.3em] uppercase font-rajdhani mb-6">
              <Sparkles className="w-4 h-4" />
              AI Automation Network
            </div>
            <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-white mb-6">
              Intelligence{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                at Scale
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-white/50 font-rajdhani leading-relaxed">
              AW GYMS leverages cutting-edge artificial intelligence to automate sales, 
              enhance customer experiences, and drive business growth 24/7 without human intervention.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div ref={sectionRef} className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * i }}
                className="glass rounded-2xl p-6 text-center border border-white/5"
              >
                <stat.icon className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <div className="text-3xl font-orbitron font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/40 font-rajdhani">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-orbitron font-bold text-white mb-4">
              Automation{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Features
              </span>
            </h2>
            <p className="max-w-xl mx-auto text-white/50 font-rajdhani">
              Every aspect of AW GYMS is powered by intelligent automation designed to 
              maximize efficiency and customer satisfaction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                whileHover={{ y: -5 }}
                className="glass rounded-2xl p-8 border border-white/5 group hover:border-yellow-500/20 transition-all"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-orbitron font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/40 font-rajdhani leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Flow */}
      <div className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-8 md:p-12 border border-white/5">
            <h2 className="text-2xl md:text-4xl font-orbitron font-bold text-white mb-8 text-center">
              How the AI Network{" "}
              <span className="text-yellow-400">Works</span>
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "01", title: "User Visits", desc: "Customer lands on AW GYMS website" },
                { step: "02", title: "AI Engages", desc: "Chatbot initiates personalized conversation" },
                { step: "03", title: "Qualifies Lead", desc: "AI assesses needs and recommends products/services" },
                { step: "04", title: "Drives Sales", desc: "Routes to WhatsApp for instant closing" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-orbitron font-bold text-yellow-400">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-orbitron font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/40 font-rajdhani">{item.desc}</p>
                  {i < 3 && (
                    <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                      <ArrowLeft className="w-6 h-6 text-yellow-500/20 rotate-180" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-orbitron font-bold text-white mb-6">
            Ready to{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Automate?
            </span>
          </h2>
          <p className="text-white/50 font-rajdhani mb-8 max-w-xl mx-auto">
            Experience the full power of AI-driven fitness business automation. 
            Every interaction is an opportunity when intelligence is always on.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-8 py-4 bg-yellow-500 text-black font-orbitron font-bold tracking-wider uppercase rounded-full hover:bg-yellow-400 transition-all"
            >
              Visit AW GYMS
            </Link>
            <a
              href="https://wa.me/923497814918?text=Hi! I want to learn more about AI automation for my gym."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-white/20 text-white font-orbitron font-bold tracking-wider uppercase rounded-full hover:bg-white/5 transition-all"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
