import { createHash } from "crypto";
import { getDb } from "../api/queries/connection";
import { products, events, settings } from "./schema";

const GYM_EQUIPMENT_EMBED = `<iframe title="Gym Equipments" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share src="https://sketchfab.com/models/14a4a06784d9429085b19135af75db25/embed?autostart=1&scrollwheel=0"></iframe>`;

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Wipe existing seed scope (safe on first deploy / reseed)
  await db.delete(products);
  await db.delete(events);
  await db.delete(settings);

  await db.insert(products).values([
    {
      name: "AW TITAN Commercial Treadmill — 4.0HP AC, 15.6\" Smart Console",
      category: "equipment",
      description:
        "Flagship commercial treadmill with 4.0HP AC drive, 15.6\" TFT entertainment console, 0–22 km/h, 15% auto incline and a 160kg user rating. Built for 12-hour daily commercial duty.",
      pricePkr: 685000,
      compareAtPkr: 745000,
      mediaType: "image",
      mediaUrl: "/assets/products/treadmill-viva.jpg",
      badge: "Flagship",
      stock: 4,
      featured: true,
      sortOrder: 1,
    },
    {
      name: "AW Functional Trainer — Dual Cable Cross + Adjustable Bench",
      category: "equipment",
      description:
        "Dual 90kg weight-stack functional trainer with 22 cable positions, multi-grip pull-up station and commercial FID bench included. Explore it in full 3D — drag to rotate.",
      pricePkr: 895000,
      compareAtPkr: 995000,
      mediaType: "model3d",
      mediaUrl: "/assets/products/functional-trainer.jpg",
      embedCode: GYM_EQUIPMENT_EMBED,
      badge: "3D Interactive",
      stock: 2,
      featured: true,
      sortOrder: 2,
    },
    {
      name: "AW 45° Leg Press / Hack Squat Combo",
      category: "equipment",
      description:
        "Plate-loaded 45° leg press and hack squat combo on commercial linear bearings. 500kg load capacity, flip-and-lock back pads, diamond-plate foot platforms.",
      pricePkr: 545000,
      compareAtPkr: 625000,
      mediaType: "image",
      mediaUrl: "/assets/products/leg-press.jpg",
      badge: "Best Seller",
      stock: 3,
      featured: true,
      sortOrder: 3,
    },
    {
      name: "AW Pec Deck / Rear Delt Pro",
      category: "equipment",
      description:
        "Selectorized pec fly / rear delt machine with 100kg stack, independent cam arms and adjustable range of motion for complete chest isolation.",
      pricePkr: 245000,
      compareAtPkr: 285000,
      mediaType: "image",
      mediaUrl: "/assets/products/pec-deck.jpg",
      stock: 5,
      sortOrder: 4,
    },
    {
      name: "AW Plate-Loaded Seated Row",
      category: "equipment",
      description:
        "Commercial plate-loaded seated row with adjustable chest pad, dual-grip handles and independent arm movement for balanced back development.",
      pricePkr: 165000,
      compareAtPkr: 195000,
      mediaType: "image",
      mediaUrl: "/assets/products/seated-row.jpg",
      stock: 6,
      sortOrder: 5,
    },
    {
      name: "AW Velocity Commercial Spin Bike",
      category: "equipment",
      description:
        "22kg perimeter-weighted flywheel, friction resistance, LCD console and micro-adjustable race saddle. Rated for studio classes, 150kg user weight.",
      pricePkr: 84500,
      compareAtPkr: 99000,
      mediaType: "image",
      mediaUrl: "/assets/products/spin-bike.jpg",
      stock: 12,
      sortOrder: 6,
    },
    {
      name: "AW Adjustable Dumbbells — 24kg Pair",
      category: "equipment",
      description:
        "Space-saving dial-adjustable dumbbell pair, 2.5–24kg per hand in 15 increments. Replaces 15 fixed pairs with one twist-lock station.",
      pricePkr: 58500,
      compareAtPkr: 68000,
      mediaType: "image",
      mediaUrl: "/assets/products/adjustable-dumbbells.jpg",
      badge: "Home Gym Pick",
      stock: 9,
      sortOrder: 7,
    },
    {
      name: "AW Pro Kettlebell Trio — 6 / 8 / 10 kg",
      category: "accessories",
      description:
        "Rubber-coated cast-iron kettlebell set (6kg, 8kg, 10kg) with chrome knurled handles. Floor-safe, chip-resistant, color-banded.",
      pricePkr: 24500,
      compareAtPkr: 29000,
      mediaType: "image",
      mediaUrl: "/assets/products/kettlebell-set.jpg",
      stock: 20,
      sortOrder: 8,
    },
    {
      name: "AW NBR Pro Training Mat — 10mm",
      category: "accessories",
      description:
        "High-density 10mm NBR exercise mat with non-slip ribbed texture, 183 × 61cm. Sweat-resistant, tear-proof, carry strap included.",
      pricePkr: 3450,
      compareAtPkr: 4500,
      mediaType: "image",
      mediaUrl: "/assets/products/yoga-mat.jpg",
      stock: 60,
      sortOrder: 9,
    },
    {
      name: "ON Gold Standard 100% Whey — 5 lb Double Rich Chocolate",
      category: "supplements",
      description:
        "The world's best-selling whey. 24g protein, 5.5g BCAAs per scoop, 74 servings. 100% original, authorised import — batch and QR verifiable.",
      pricePkr: 36855,
      compareAtPkr: 41000,
      mediaType: "video",
      mediaUrl: "/assets/videos/product-whey.mp4",
      badge: "Best Seller",
      stock: 25,
      featured: true,
      sortOrder: 10,
    },
    {
      name: "ON Micronized Creatine Monohydrate — 300g (60 Servings)",
      category: "supplements",
      description:
        "5g pure micronized creatine monohydrate per serving. Informed-Choice certified, unflavored, 60 servings per tub.",
      pricePkr: 11655,
      compareAtPkr: 12950,
      mediaType: "image",
      mediaUrl: "/assets/products/creatine-on.jpg",
      stock: 30,
      sortOrder: 11,
    },
    {
      name: "Nutrex Creatine Monohydrate — 1kg (200 Servings)",
      category: "supplements",
      description:
        "Ultra-pure micronized creatine monohydrate, 5g per scoop, 200 servings. The best value-per-gram creatine in the AW lineup.",
      pricePkr: 19950,
      compareAtPkr: 22500,
      mediaType: "image",
      mediaUrl: "/assets/products/creatine-nutrex.jpg",
      stock: 18,
      sortOrder: 12,
    },
    {
      name: "Kevin Levrone Anabolic Mass — 3kg",
      category: "supplements",
      description:
        "New-generation all-in-one gainer: 30g five-source protein, 60g carbs, creatine, HMB, DAA and fenugreek per 100g serving. Halal certified.",
      pricePkr: 18500,
      compareAtPkr: 21000,
      mediaType: "image",
      mediaUrl: "/assets/products/anabolic-mass.jpg",
      badge: "Hardgainer Choice",
      stock: 22,
      sortOrder: 13,
    },
    {
      name: "Route2Health Vitamin D3 5000 IU — 30 Chewable Tablets",
      category: "supplements",
      description:
        "High-potency sunshine vitamin for bone strength, immunity and hormonal health. DRAP-registered local manufacture, orange chewables.",
      pricePkr: 1250,
      compareAtPkr: 1600,
      mediaType: "image",
      mediaUrl: "/assets/products/vitamin-d3.jpg",
      stock: 80,
      sortOrder: 14,
    },
    {
      name: "Nature's Bounty Omega-3 1000mg — 30 Softgels",
      category: "supplements",
      description:
        "Plant-based algae-oil omega-3, 70% more concentrated EPA/DHA for heart, joint and cognitive support. Vegetarian softgels.",
      pricePkr: 5250,
      compareAtPkr: 6500,
      mediaType: "image",
      mediaUrl: "/assets/products/omega-3.jpg",
      stock: 40,
      sortOrder: 15,
    },
  ]);

  await db.insert(events).values([
    {
      title: "AW Strength & Conditioning Masterclass",
      description:
        "A 3-hour intensive on barbell mechanics, bracing and progressive overload with AW head coaches. Includes movement screening and a personalized loading chart.",
      category: "Masterclass",
      location: "AW Flagship Facility — Lahore",
      startAt: new Date("2026-08-01T17:00:00+05:00"),
      seats: 40,
      pricePkr: 4999,
      status: "upcoming",
    },
    {
      title: "Nutrition & Supplementation Clinic",
      description:
        "Evidence-based nutrition periodization, supplement timing, and how to verify authentic imports in the Pakistani market. Q&A with a certified sports nutritionist.",
      category: "Clinic",
      location: "AW Flagship Facility — Lahore",
      startAt: new Date("2026-08-16T17:00:00+05:00"),
      seats: 35,
      pricePkr: 3999,
      status: "upcoming",
    },
    {
      title: "Hypertrophy Blueprint — 8-Week Block Launch",
      description:
        "Cohort kickoff for the AW 8-week hypertrophy block: programming walkthrough, measurement day, WhatsApp cohort access and weekly check-ins.",
      category: "Program",
      location: "AW Flagship Facility + Online",
      startAt: new Date("2026-08-31T10:00:00+05:00"),
      seats: 25,
      pricePkr: 5999,
      status: "upcoming",
    },
    {
      title: "AW Grand Opening Showcase",
      description:
        "Facility reveal night with athlete demos, supplement tastings and founding-member offers.",
      category: "Showcase",
      location: "AW Flagship Facility — Lahore",
      startAt: new Date("2026-07-02T19:00:00+05:00"),
      seats: 100,
      pricePkr: 0,
      status: "archived",
    },
  ]);

  await db.insert(settings).values([
    { key: "whatsapp_number", value: "923497814918" },
    { key: "usd_rate", value: "281" },
    { key: "aed_rate", value: "76.6" },
    { key: "admin_username", value: "admin" },
    {
      key: "admin_password_hash",
      value: createHash("sha256").update("awgyms2026").digest("hex"),
    },
    { key: "announcement", value: "Free nationwide delivery on orders above Rs 50,000" },
  ]);

  console.log("Done.");
  process.exit(0);
}

seed();
