import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import {
  Menu,
  X,
  Dumbbell,
  Home,
  ShoppingBag,
  Box,
  MessageCircle,
  Calendar,
  Settings,
  LogIn,
  LogOut,
  User,
  Music,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  onMusicToggle: () => void;
  isMusicPlaying: boolean;
}

export default function Navigation({ onMusicToggle, isMusicPlaying }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home", icon: Home },
    { label: "Products", href: "#products", icon: ShoppingBag },
    { label: "3D Models", href: "#models", icon: Box },
    { label: "AR Experience", href: "#ar", icon: Sparkles },
    { label: "AI Chat", href: "#ai-chat", icon: MessageCircle },
    { label: "Book Now", href: "#book", icon: Calendar },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/90 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2 group">
              <Dumbbell className="w-7 h-7 text-yellow-500 group-hover:rotate-12 transition-transform" />
              <span
                className="text-xl md:text-2xl font-orbitron font-bold tracking-wider"
                style={{
                  background:
                    "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AW GYMS
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-rajdhani font-medium text-white/70 hover:text-yellow-400 transition-colors tracking-wide uppercase"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={onMusicToggle}
                className={`p-2 rounded-full transition-all ${
                  isMusicPlaying
                    ? "bg-yellow-500/20 text-yellow-400 animate-pulse-glow"
                    : "text-white/60 hover:text-yellow-400"
                }`}
              >
                <Music className="w-5 h-5" />
              </button>

              {isAuthenticated && user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="p-2 text-white/60 hover:text-yellow-400 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              )}

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <User className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-white/80">{user?.name || "User"}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-white/60 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 hover:bg-yellow-500/20 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="text-sm font-medium">Login</span>
                </Link>
              )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-white"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-6">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-2xl font-orbitron text-white/80 hover:text-yellow-400 transition-colors"
                >
                  <link.icon className="w-6 h-6" />
                  {link.label}
                </motion.a>
              ))}
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => {
                    onMusicToggle();
                    setMenuOpen(false);
                  }}
                  className="p-3 rounded-full bg-white/5 text-white/60"
                >
                  <Music className="w-6 h-6" />
                </button>
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-full text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400"
                  >
                    <LogIn className="w-5 h-5" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
