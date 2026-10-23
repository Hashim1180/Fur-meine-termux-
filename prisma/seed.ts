// AW GYMS 2.0 — seed script
// Run: bun run db:seed  (or via prisma db seed)
import { db } from "../src/lib/db";

async function main() {
  // Wipe
  await db.media.deleteMany();
  await db.event.deleteMany();
  await db.product.deleteMany();
  await db.setting.deleteMany();
  await db.adminSession.deleteMany();

  // --- Settings ---
  const settings: Record<string, string> = {
    whatsappNumber: "+923497814918",
    usdRate: "278",   // 1 USD = 278 PKR
    aedRate: "75.6", // 1 AED = 75.6 PKR
    announcement: "AW GYMS 2.0 — The immersive flagship is live. Lock insider pricing this week.",
    adminPassword: "awgyms2026",
    sketchfabUrl: "https://sketchfab.com/models/fbd1baf5f56743e6bd4299ad91473b9a/embed",
    brandName: "AW GYMS",
    brandTagline: "THERE IS NO SHORTCUT",
  };
  for (const [k, v] of Object.entries(settings)) {
    await db.setting.create({ data: { id: k, value: v } });
  }

  // --- Products (PKR base) ---
  const now = Date.now();
  const day = 86400000;

  const products = [
    {
      name: "ON Gold Standard Whey 5lb",
      category: "Supplements",
      tagline: "The industry benchmark for 24g whey isolate.",
      description:
        "Optimum Nutrition's flagship — 24g of blended whey isolate per scoop, 5.5g BCAAs, ultra-smooth mixability. Sourced through authorised PK distribution with full batch traceability.",
      pricePKR: 36855,
      badges: "Best Seller|Authentic|24g Protein",
      image: "/media/photos/whey-gold.jpg",
      video: "/media/videos/product-whey.mp4",
      featured: true,
      inStock: true,
      rating: 5,
      order: 1,
    },
    {
      name: "ON Creatine Monohydrate 300g",
      category: "Supplements",
      tagline: "Micronised creatine for raw strength output.",
      description:
        "100% pure micronised creatine monohydrate — 60 servings at 5g each. Unflavoured, mixes instantly, no bloating. The single most studied ergogenic aid in sport science.",
      pricePKR: 11655,
      badges: "Authentic|60 Servings",
      image: "/media/photos/creatine-on.jpg",
      featured: true,
      inStock: true,
      rating: 5,
      order: 2,
    },
    {
      name: "Pro Studio Yoga Mat",
      category: "Accessories",
      tagline: "8mm closed-cell grip for floor work.",
      description:
        "Extra-thick 8mm TPE mat with dual-layer grip. Non-slip even during hot flows. Lightweight, rolls tight, odour-resistant.",
      pricePKR: 4500,
      badges: "8mm Grip|Eco TPE",
      image: "/media/photos/yoga-mat.jpg",
      featured: false,
      inStock: true,
      rating: 4.8,
      order: 3,
    },
    {
      name: "VirtuFit Spin Bike Pro",
      category: "Cardio",
      tagline: "Magnetic resistance, 18kg flywheel.",
      description:
        "Commercial-grade spin bike with 18kg balanced flywheel, 8-level magnetic resistance, and a belt drive for silent operation. Supports 150kg user weight. LCD telemetry included.",
      pricePKR: 145000,
      badges: "18kg Flywheel|Commercial|Belt Drive",
      image: "/media/photos/spin-bike.jpg",
      featured: true,
      inStock: true,
      rating: 4.9,
      order: 4,
    },
    {
      name: "Viva Commercial Treadmill",
      category: "Cardio",
      tagline: "4.0HP AC motor, top speed 22 km/h.",
      description:
        "Full commercial treadmill with 4.0HP AC motor, 22 km/h top speed, 0-15% auto incline, and a 60x152cm running surface. Includes HR telemetry and 12 pre-set programmes.",
      pricePKR: 685000,
      badges: "4.0HP AC|22 km/h|Commercial",
      image: "/media/photos/treadmill-viva.jpg",
      featured: true,
      inStock: true,
      rating: 5,
      order: 5,
    },
    {
      name: "Leg Press / Hack Squat Combo",
      category: "Strength",
      tagline: "Dual-rail, 450kg capacity.",
      description:
        "Combined leg press and hack squat on a 45° dual-rail carriage. 450kg load capacity, commercial bushings, three-position foot plate. The cornerstone of any serious leg day.",
      pricePKR: 545000,
      badges: "450kg Cap|Dual Function|Commercial",
      image: "/media/photos/leg-press.jpg",
      featured: true,
      inStock: true,
      rating: 5,
      order: 6,
    },
    {
      name: "Adjustable Dumbbell Set 2.5–24kg",
      category: "Strength",
      tagline: "One pair, fifteen weight steps.",
      description:
        "Select-a-weight dumbbell pair covering 2.5kg to 24kg per hand in 1.5kg increments. Steel cradle, magnetic pin selector. Replaces a 15-pair rack in a single footprint.",
      pricePKR: 85000,
      badges: "2.5–24kg|Magnetic Pin|Space Saver",
      image: "/media/photos/adjustable-dumbbells.jpg",
      featured: false,
      inStock: true,
      rating: 4.7,
      order: 7,
    },
  ];
  for (const p of products) {
    await db.product.create({ data: p });
  }

  // --- Events (15-day cycles, staggered, auto-archive) ---
  const events = [
    {
      title: "Strength Foundations",
      subtitle: "Block I · Linear Progression",
      description:
        "A 15-day primer on the big four lifts. Daily programming, video form-checks, and progressive overload tracking. For lifters returning to the bar.",
      location: "Lahore · Gulberg Flagship",
      capacity: 24,
      enrolled: 18,
      durationDays: 15,
      startDate: new Date(now + 2 * day),
      endDate: new Date(now + 17 * day),
      accent: "neon",
      order: 1,
    },
    {
      title: "Hypertrophy Block",
      subtitle: "Block II · Volume Engine",
      description:
        "15 days of high-volume split work. Mechanical tension overload with autoregulated RPE caps. For athletes chasing measurable muscle accretion.",
      location: "Karachi · Clifton Studio",
      capacity: 20,
      enrolled: 9,
      durationDays: 15,
      startDate: new Date(now + 8 * day),
      endDate: new Date(now + 23 * day),
      accent: "crimson",
      order: 2,
    },
    {
      title: "Conditioning Circuit",
      subtitle: "Block III · Engine Capacity",
      description:
        "15-day metabolic conditioning block. Heart-rate banded intervals, rower + ski erg + sled. For building a diesel engine under the hood.",
      location: "Islamabad · F-7 Performance Lab",
      capacity: 16,
      enrolled: 4,
      durationDays: 15,
      startDate: new Date(now + 14 * day),
      endDate: new Date(now + 29 * day),
      accent: "gold",
      order: 3,
    },
  ];
  for (const e of events) {
    await db.event.create({ data: e });
  }

  // --- Media library (auto-seed existing files) ---
  const media = [
    { type: "photo", name: "ON Gold Standard Whey", path: "/media/photos/whey-gold.jpg", mime: "image/jpeg", size: 33945, tag: "product" },
    { type: "photo", name: "ON Creatine", path: "/media/photos/creatine-on.jpg", mime: "image/jpeg", size: 23230, tag: "product" },
    { type: "photo", name: "Pro Yoga Mat", path: "/media/photos/yoga-mat.jpg", mime: "image/jpeg", size: 25912, tag: "product" },
    { type: "photo", name: "VirtuFit Spin Bike", path: "/media/photos/spin-bike.jpg", mime: "image/jpeg", size: 25166, tag: "product" },
    { type: "photo", name: "Viva Treadmill", path: "/media/photos/treadmill-viva.jpg", mime: "image/jpeg", size: 17379, tag: "product" },
    { type: "photo", name: "Leg Press", path: "/media/photos/leg-press.jpg", mime: "image/jpeg", size: 26876, tag: "product" },
    { type: "photo", name: "Adjustable Dumbbells", path: "/media/photos/adjustable-dumbbells.jpg", mime: "image/jpeg", size: 23449, tag: "product" },
    { type: "video", name: "Facility — Dark", path: "/media/videos/facility-dark.mp4", mime: "video/mp4", size: 7522032, tag: "facility" },
    { type: "video", name: "ON Whey Product Film", path: "/media/videos/product-whey.mp4", mime: "video/mp4", size: 3172077, tag: "product" },
  ];
  for (const m of media) {
    await db.media.create({ data: m });
  }

  console.log("Seed complete:", products.length, "products,", events.length, "events,", media.length, "media,", Object.keys(settings).length, "settings");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
