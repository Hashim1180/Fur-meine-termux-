import { Link } from "react-router";
import { Dumbbell, MapPin, Phone, Mail, Instagram, Facebook, Youtube, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <Dumbbell className="w-6 h-6 text-yellow-500" />
              <span
                className="text-xl font-orbitron font-bold tracking-wider"
                style={{
                  background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AW GYMS
              </span>
            </Link>
            <p className="text-sm text-white/40 font-rajdhani leading-relaxed mb-6">
              Pakistan&apos;s premier fitness destination. State-of-the-art equipment, 
              expert trainers, and an unmatched atmosphere for your fitness journey.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-yellow-400 hover:border-yellow-500/30 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-orbitron font-bold text-white text-sm tracking-wider uppercase mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "#home" },
                { label: "Products", href: "#products" },
                { label: "3D Models", href: "#models" },
                { label: "AR Experience", href: "#ar" },
                { label: "Book Now", href: "#book" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/40 hover:text-yellow-400 transition-colors font-rajdhani flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-orbitron font-bold text-white text-sm tracking-wider uppercase mb-6">
              Services
            </h4>
            <ul className="space-y-3">
              {[
                "Personal Training",
                "Group Classes",
                "Nutrition Planning",
                "Equipment Sales",
                "Corporate Wellness",
              ].map((service) => (
                <li key={service}>
                  <span className="text-sm text-white/40 font-rajdhani">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-orbitron font-bold text-white text-sm tracking-wider uppercase mb-6">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-500/60 mt-0.5" />
                <span className="text-sm text-white/40 font-rajdhani">
                  Main Boulevard, Gulberg, Lahore, Pakistan
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-yellow-500/60" />
                <a
                  href="https://wa.me/923497814918"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/40 hover:text-yellow-400 transition-colors font-rajdhani"
                >
                  +92 349 7814918
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-yellow-500/60" />
                <span className="text-sm text-white/40 font-rajdhani">
                  info@awgyms.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 font-rajdhani">
            &copy; {currentYear} AW GYMS. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-white/30 hover:text-white/60 transition-colors font-rajdhani"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
