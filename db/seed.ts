import { getDb } from "../api/queries/connection";
import { products, videos, siteSettings } from "./schema";

async function seed() {
  const db = getDb();

  // Seed products with your uploaded images
  await db.insert(products).values([
    {
      name: "Premium Hex Dumbbells Set",
      description: "High-quality rubber-coated hex dumbbells. Perfect for home and commercial gyms. Available in multiple weights for progressive training.",
      price: "149.99",
      image: "/assets/images/dumbbells.jpg",
      category: "Equipment",
      inStock: true,
      featured: true,
    },
    {
      name: "Olympic Bench Press Station",
      description: "Heavy-duty Olympic bench press with adjustable incline/decline positions. Supports up to 600 lbs. Professional grade for serious lifters.",
      price: "599.99",
      image: "/assets/images/bench-press.jpg",
      category: "Equipment",
      inStock: true,
      featured: true,
    },
    {
      name: "Gold Standard Whey Protein",
      description: "Optimum Nutrition 100% Whey Gold Standard. 24g protein per serving, 5.5g BCAAs. Banned substance tested. 73 servings.",
      price: "59.99",
      image: "/assets/images/whey-protein.jpg",
      category: "Supplements",
      inStock: true,
      featured: false,
    },
    {
      name: "Interlocking Gym Floor Mats",
      description: "EVA foam interlocking gym floor tiles. Non-slip surface, shock absorbent, easy to install. Protects floors and reduces noise.",
      price: "89.99",
      image: "/assets/images/gym-mat.jpg",
      category: "Accessories",
      inStock: true,
      featured: false,
    },
    {
      name: "Commercial Treadmill Pro",
      description: "Freemotion commercial-grade treadmill with digital console. Multiple workout programs, heart rate monitoring, shock absorption deck.",
      price: "2499.99",
      image: "/assets/images/treadmill.jpg",
      category: "Cardio",
      inStock: true,
      featured: true,
    },
    {
      name: "Elliptical Cross Trainer",
      description: "2-in-1 elliptical bike cross trainer. Low-impact full-body cardio workout. Digital display with multiple resistance levels.",
      price: "899.99",
      image: "/assets/images/elliptical.jpg",
      category: "Cardio",
      inStock: true,
      featured: false,
    },
    {
      name: "Gold Creatine Monohydrate",
      description: "Kevin Levrone Gold Creatine. Micronized for better absorption. Increases strength, power, and muscle volume. 300g container.",
      price: "34.99",
      image: "/assets/images/creatine.jpg",
      category: "Supplements",
      inStock: true,
      featured: false,
    },
  ]);

  // Seed videos
  await db.insert(videos).values([
    { title: "Gym Motivation 1", url: "/assets/videos/video1.mp4", section: "hero", active: true, order: 1 },
    { title: "Workout Power", url: "/assets/videos/video2.mp4", section: "workouts", active: true, order: 2 },
    { title: "Training Intensity", url: "/assets/videos/video3.mp4", section: "training", active: true, order: 3 },
    { title: "Fitness Journey", url: "/assets/videos/video4.mp4", section: "about", active: true, order: 4 },
    { title: "Strength Focus", url: "/assets/videos/video5.mp4", section: "products", active: true, order: 5 },
    { title: "Cardio Blast", url: "/assets/videos/video6.mp4", section: "cardio", active: true, order: 6 },
    { title: "Gym Atmosphere", url: "/assets/videos/video7.mp4", section: "gallery", active: true, order: 7 },
    { title: "Premium Experience", url: "/assets/videos/video8.mp4", section: "premium", active: true, order: 8 },
  ]);

  // Seed site settings
  await db.insert(siteSettings).values([
    { key: "whatsapp_number", value: "+92 349 7814918" },
    { key: "site_title", value: "AW GYMS - Premium Fitness Experience" },
    { key: "hero_subtitle", value: "Transform Your Body. Elevate Your Mind." },
    { key: "about_text", value: "AW GYMS is Pakistan's premier fitness destination, offering state-of-the-art equipment, expert trainers, and an unmatched atmosphere for your fitness journey." },
  ]);

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
