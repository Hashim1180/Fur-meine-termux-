import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShoppingCart, Eye, Star, ArrowRight } from "lucide-react";
import { trpc } from "@/providers/trpc";

gsap.registerPlugin(ScrollTrigger);

const staticProducts = [
  {
    id: 1,
    name: "Premium Hex Dumbbells Set",
    description: "High-quality rubber-coated hex dumbbells. Perfect for home and commercial gyms.",
    price: "149.99",
    image: "/assets/images/dumbbells.jpg",
    category: "Equipment",
    inStock: true,
    featured: true,
  },
  {
    id: 2,
    name: "Olympic Bench Press Station",
    description: "Heavy-duty Olympic bench press with adjustable positions. Supports up to 600 lbs.",
    price: "599.99",
    image: "/assets/images/bench-press.jpg",
    category: "Equipment",
    inStock: true,
    featured: true,
  },
  {
    id: 3,
    name: "Gold Standard Whey Protein",
    description: "Optimum Nutrition 100% Whey. 24g protein per serving, 5.5g BCAAs.",
    price: "59.99",
    image: "/assets/images/whey-protein.jpg",
    category: "Supplements",
    inStock: true,
    featured: false,
  },
  {
    id: 4,
    name: "Interlocking Gym Floor Mats",
    description: "EVA foam interlocking tiles. Non-slip, shock absorbent, easy to install.",
    price: "89.99",
    image: "/assets/images/gym-mat.jpg",
    category: "Accessories",
    inStock: true,
    featured: false,
  },
  {
    id: 5,
    name: "Commercial Treadmill Pro",
    description: "Freemotion commercial-grade treadmill with digital console and shock absorption.",
    price: "2499.99",
    image: "/assets/images/treadmill.jpg",
    category: "Cardio",
    inStock: true,
    featured: true,
  },
  {
    id: 6,
    name: "Elliptical Cross Trainer",
    description: "2-in-1 elliptical bike. Low-impact full-body cardio with digital display.",
    price: "899.99",
    image: "/assets/images/elliptical.jpg",
    category: "Cardio",
    inStock: true,
    featured: false,
  },
  {
    id: 7,
    name: "Gold Creatine Monohydrate",
    description: "Kevin Levrone Gold Creatine. Micronized for better absorption.",
    price: "34.99",
    image: "/assets/images/creatine.jpg",
    category: "Supplements",
    inStock: true,
    featured: false,
  },
];

export default function ProductsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  const { data: dbProducts } = trpc.product.list.useQuery();

  const products = dbProducts && dbProducts.length > 0 ? dbProducts : staticProducts;

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter((c): c is string => !!c)))];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".product-card", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [filteredProducts]);

  return (
    <section
      ref={sectionRef}
      id="products"
      className="relative bg-black py-24 md:py-40 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <video
          className="w-full h-full object-cover"
          src="/assets/videos/video5.mp4"
          muted
          loop
          autoPlay
          playsInline
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="inline-block px-4 py-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs tracking-[0.3em] uppercase font-rajdhani mb-6"
          >
            Our Collection
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6"
          >
            Premium{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Equipment
            </span>
          </motion.h2>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-rajdhani font-medium tracking-wider uppercase transition-all ${
                  selectedCategory === cat
                    ? "bg-yellow-500 text-black"
                    : "bg-white/5 text-white/60 border border-white/10 hover:border-yellow-500/30 hover:text-yellow-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              className="product-card group relative glass rounded-2xl overflow-hidden"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-64 overflow-hidden bg-gradient-to-b from-gray-900 to-black">
                <motion.img
                  src={product.image || "/assets/images/dumbbells.jpg"}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                  animate={
                    hoveredProduct === product.id
                      ? { scale: 1.1, rotateY: 5 }
                      : { scale: 1, rotateY: 0 }
                  }
                  transition={{ duration: 0.4 }}
                />
                {product.featured && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500/90 text-black text-xs font-bold rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Featured
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </div>

              <div className="p-6">
                <div className="text-xs text-yellow-500 font-rajdhani uppercase tracking-wider mb-2">
                  {product.category}
                </div>
                <h3 className="text-lg font-orbitron font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-white/50 font-rajdhani mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-orbitron font-bold text-white">
                    <span className="text-yellow-500">$</span>
                    {product.price}
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-yellow-500/20 hover:text-yellow-400 hover:border-yellow-500/30 transition-all">
                      <Eye className="w-5 h-5" />
                    </button>
                    <a
                      href={`https://wa.me/923497814918?text=Hi AW GYMS! I'm interested in purchasing ${encodeURIComponent(product.name)} for $${product.price}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500 hover:text-black transition-all"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="https://wa.me/923497814918?text=Hi AW GYMS! I want to see your full product catalog."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 border border-yellow-500/30 text-yellow-400 font-orbitron font-bold tracking-wider uppercase text-sm rounded-full hover:bg-yellow-500 hover:text-black transition-all"
          >
            View Full Catalog
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
