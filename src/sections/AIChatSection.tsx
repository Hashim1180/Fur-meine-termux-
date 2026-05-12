import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Bot, User, Loader2, Phone } from "lucide-react";
import { trpc } from "@/providers/trpc";

interface ChatMessage {
  id: number;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export default function AIChatSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      sender: "ai",
      text: "Welcome to AW GYMS! I'm your AI fitness assistant. How can I help you today? I can help with workout plans, product recommendations, pricing, or booking appointments. You can also reach us directly on WhatsApp at +92 349 7814918.",
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          sender: "ai",
          text: data.response,
          timestamp: new Date(),
        },
      ]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    chatMutation.mutate({
      message: input,
      name: "Website Visitor",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="ai-chat"
      className="relative bg-black py-24 md:py-40 overflow-hidden"
    >
      <div className="absolute inset-0">
        <video
          className="w-full h-full object-cover opacity-10"
          src="/assets/videos/video7.mp4"
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
            AI Powered
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6"
          >
            AI Fitness{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Assistant
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="max-w-xl mx-auto text-white/50 font-rajdhani"
          >
            Our intelligent AI assistant is ready to help you with workout plans, 
            product recommendations, pricing, and instant booking.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass rounded-2xl overflow-hidden border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-white text-sm">AW AI Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-white/40 font-rajdhani">Online</span>
                  </div>
                </div>
              </div>
              <a
                href="https://wa.me/923497814918"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-3 ${
                      msg.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.sender === "ai"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {msg.sender === "ai" ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-sm font-rajdhani ${
                        msg.sender === "ai"
                          ? "bg-white/5 text-white/80 rounded-tl-none"
                          : "bg-yellow-500/10 text-yellow-100 rounded-tr-none border border-yellow-500/20"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {chatMutation.isPending && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-none p-3">
                    <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about workouts, products, pricing..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 font-rajdhani focus:outline-none focus:border-yellow-500/30 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={chatMutation.isPending || !input.trim()}
                  className="p-2.5 rounded-xl bg-yellow-500 text-black hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {["Workout Plans", "Pricing", "Products", "Book Appointment"].map(
                  (quick) => (
                    <button
                      key={quick}
                      onClick={() => {
                        setInput(quick);
                      }}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 hover:text-yellow-400 hover:border-yellow-500/20 transition-colors font-rajdhani"
                    >
                      {quick}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-yellow-500 text-black flex items-center justify-center shadow-lg shadow-yellow-500/20"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </section>
  );
}
