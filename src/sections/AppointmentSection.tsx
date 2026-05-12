import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Calendar, Phone, Mail, User, MessageSquare, CheckCircle, ArrowRight } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function AppointmentSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const appointmentMutation = trpc.appointment.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", date: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    appointmentMutation.mutate(formData);
  };

  return (
    <section
      ref={sectionRef}
      id="book"
      className="relative bg-black py-24 md:py-40 overflow-hidden"
    >
      <div className="absolute inset-0">
        <video
          className="w-full h-full object-cover opacity-10"
          src="/assets/videos/video8.mp4"
          muted
          loop
          autoPlay
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-block px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs tracking-[0.3em] uppercase font-rajdhani mb-6">
              Get Started
            </span>
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-6">
              Book Your{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Session
              </span>
            </h2>
            <p className="text-white/50 font-rajdhani mb-8 leading-relaxed">
              Ready to transform? Book a consultation with our expert trainers or 
              schedule a tour of our facility. We&apos;ll help you create a personalized 
              fitness plan tailored to your goals.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: Phone, label: "WhatsApp", value: "+92 349 7814918" },
                { icon: Mail, label: "Email", value: "info@awgyms.com" },
                { icon: Calendar, label: "Hours", value: "5 AM - 11 PM Daily" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-xs text-white/40 font-rajdhani uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className="text-white font-rajdhani">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/923497814918?text=Hi AW GYMS! I want to book a consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 font-medium hover:bg-green-500/20 transition-all"
            >
              <Phone className="w-4 h-4" />
              Book via WhatsApp
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <div className="glass rounded-2xl p-8 border border-white/10">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-orbitron font-bold text-white mb-2">
                    Booking Received!
                  </h3>
                  <p className="text-white/50 font-rajdhani">
                    We&apos;ll contact you shortly to confirm your appointment.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-white/60 font-rajdhani mb-2">
                      <User className="w-4 h-4 text-yellow-500" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30 transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm text-white/60 font-rajdhani mb-2">
                        <Mail className="w-4 h-4 text-yellow-500" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm text-white/60 font-rajdhani mb-2">
                        <Phone className="w-4 h-4 text-yellow-500" />
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30 transition-colors"
                        placeholder="+92 300 0000000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-white/60 font-rajdhani mb-2">
                      <Calendar className="w-4 h-4 text-yellow-500" />
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-white/60 font-rajdhani mb-2">
                      <MessageSquare className="w-4 h-4 text-yellow-500" />
                      Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30 transition-colors resize-none"
                      placeholder="Tell us about your fitness goals..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={appointmentMutation.isPending}
                    className="w-full py-4 bg-yellow-500 text-black font-orbitron font-bold tracking-wider uppercase rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {appointmentMutation.isPending ? (
                      <span className="animate-pulse">Submitting...</span>
                    ) : (
                      <>
                        Book Appointment
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
