import { listProducts, getSettingsMap } from "./queries/store";

export type ChatInvoice = {
  items: { name: string; qty: number; pricePkr: number }[];
  discountPct: number;
  subtotalPkr: number;
  totalPkr: number;
  whatsappUrl: string;
};

export type ChatReply = { reply: string; invoice?: ChatInvoice };

const fmt = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function scoreProduct(p: { name: string; category: string }, q: string): number {
  const words = norm(q).split(/\s+/).filter((w) => w.length > 2);
  const name = norm(`${p.name} ${p.category}`);
  let score = 0;
  for (const w of words) if (name.includes(w)) score += w.length;
  return score;
}

export async function handleChat(
  message: string,
  history: { role: string; content: string }[],
): Promise<ChatReply> {
  const q = norm(message);
  const [products, settingsMap] = await Promise.all([
    listProducts(),
    getSettingsMap(),
  ]);
  const wa = settingsMap.whatsapp_number || "923497814918";
  const active = products.filter((p) => p.stock > 0 || p.stock === 0);

  const has = (...words: string[]) => words.some((w) => q.includes(w));

  // ---- Negotiation / discount -------------------------------------------------
  if (
    has("discount", "kam kar", "kam karo", "best price", "final price", "deal", "negotiate", "sasta", "offer")
  ) {
    return {
      reply:
        "I like your style — let me make this easy. I can lock in an exclusive 5% AW Insider discount on any order you place today, and on carts above Rs 100,000 I'll stretch it to 7%. Tell me which product you want (or say “order” + product name) and I'll write up the invoice right now.",
    };
  }

  // ---- Order intent -----------------------------------------------------------
  if (has("order", "buy", "purchase", "book", "lena", "kharid", "checkout", "invoice")) {
    const ranked = [...products]
      .map((p) => ({ p, s: scoreProduct(p, q) }))
      .sort((a, b) => b.s - a.s);
    const target = ranked[0] && ranked[0].s > 0 ? ranked[0].p : null;

    // also look at last assistant/user context if no product in this message
    let chosen = target;
    if (!chosen) {
      const ctxText = history.slice(-6).map((h) => h.content).join(" ");
      const rankedCtx = [...products]
        .map((p) => ({ p, s: scoreProduct(p, ctxText) }))
        .sort((a, b) => b.s - a.s);
      if (rankedCtx[0] && rankedCtx[0].s > 0) chosen = rankedCtx[0].p;
    }

    if (!chosen) {
      return {
        reply:
          "Perfect — which product should I put on the invoice? You can say things like “order ON Whey”, “order the leg press”, or “order kettlebell set”.",
      };
    }

    const qtyMatch = q.match(/\b(\d{1,2})\s*(x|pcs|pieces|units|qty)\b/);
    const qty = qtyMatch ? Math.max(1, Math.min(10, parseInt(qtyMatch[1], 10))) : 1;
    const discountPct = chosen.pricePkr * qty >= 100000 ? 7 : 5;
    const subtotal = chosen.pricePkr * qty;
    const total = Math.round(subtotal * (1 - discountPct / 100));

    const receiptLines = [
      "AW GYMS — ORDER INVOICE",
      "------------------------------",
      `Item: ${chosen.name}`,
      `Qty: ${qty}`,
      `Rate: ${fmt(chosen.pricePkr)}`,
      `Subtotal: ${fmt(subtotal)}`,
      `AW Insider Discount (${discountPct}%): -${fmt(subtotal - total)}`,
      `TOTAL: ${fmt(total)}`,
      "------------------------------",
      "Payment: COD / Bank Transfer / EasyPaisa",
      "Delivery: Nationwide, 2–4 working days",
      "Sent from awgyms.com",
    ];
    const whatsappUrl = `https://wa.me/${wa}?text=${encodeURIComponent(receiptLines.join("\n"))}`;

    return {
      reply: `Done. Here is your official AW invoice — ${chosen.name} × ${qty} with your ${discountPct}% AW Insider discount applied. Total ${fmt(total)}. Hit “Lock in WhatsApp Deal” and it lands straight in our sales WhatsApp with everything pre-filled.`,
      invoice: {
        items: [{ name: chosen.name, qty, pricePkr: chosen.pricePkr }],
        discountPct,
        subtotalPkr: subtotal,
        totalPkr: total,
        whatsappUrl,
      },
    };
  }

  // ---- Price queries ----------------------------------------------------------
  if (has("price", "cost", "kitna", "kitne", "rate", "how much", "pkr", "rs")) {
    const ranked = [...products]
      .map((p) => ({ p, s: scoreProduct(p, q) }))
      .sort((a, b) => b.s - a.s);
    if (ranked[0] && ranked[0].s > 0) {
      const p = ranked[0].p;
      const save = p.compareAtPkr ? p.compareAtPkr - p.pricePkr : 0;
      return {
        reply: `${p.name} is ${fmt(p.pricePkr)}${save > 0 ? ` (you save ${fmt(save)} vs market ${fmt(p.compareAtPkr!)})` : ""}. ${p.stock > 0 ? `We have ${p.stock} in stock right now.` : "It's currently on backorder — I can still reserve yours."} Want me to apply your 5% Insider discount? Just say “order”.`,
      };
    }
    const byCat = (c: string) =>
      products.filter((p) => p.category === c);
    return {
      reply: `Here's the quick menu — Equipment: ${byCat("equipment").slice(0, 3).map((p) => `${p.name.split("—")[0].trim()} ${fmt(p.pricePkr)}`).join(" · ")}. Supplements: ${byCat("supplements").slice(0, 3).map((p) => `${p.name.split("—")[0].trim()} ${fmt(p.pricePkr)}`).join(" · ")}. Ask me for any specific price, or say “order” + product name to lock it in.`,
    };
  }

  // ---- Category browsing ------------------------------------------------------
  if (has("supplement", "protein", "whey", "creatine", "mass gainer", "gainer", "vitamin", "omega")) {
    const supp = products.filter((p) => p.category === "supplements");
    return {
      reply: `Our supplement wall, all 100% original and batch-verifiable: ${supp.map((p) => `${p.name.split("—")[0].trim()} — ${fmt(p.pricePkr)}`).join(" | ")}. Every tub comes with an authenticity guarantee. Which one matches your goal — muscle gain, strength, or general health?`,
    };
  }
  if (has("equipment", "machine", "treadmill", "bench", "dumbbell", "kettlebell", "bike", "leg press", "gym setup", "home gym")) {
    const eq = products.filter((p) => p.category !== "supplements");
    return {
      reply: `AW equipment lineup: ${eq.slice(0, 6).map((p) => `${p.name.split("—")[0].trim()} — ${fmt(p.pricePkr)}`).join(" | ")}. All commercial-grade with installation support in Lahore, Karachi and Islamabad. Tell me your space and budget and I'll spec the perfect setup.`,
    };
  }

  // ---- Delivery / payment / authenticity --------------------------------------
  if (has("deliver", "shipping", "cod", "cash on delivery", "payment")) {
    return {
      reply:
        "Delivery is nationwide across Pakistan in 2–4 working days (1–2 days in Lahore). We accept Cash on Delivery, bank transfer and EasyPaisa. Orders above Rs 50,000 ship free. Heavy equipment includes professional installation in major cities.",
    };
  }
  if (has("original", "authentic", "fake", "genuine", "real")) {
    return {
      reply:
        "Fair question — Pakistan's market is flooded with counterfeits. Every AW supplement is an authorised import with a scannable QR batch code and verifiable lot number. If any product fails verification, we refund 200%. That's the AW guarantee.",
    };
  }
  if (has("location", "address", "where", "timing", "open", "hours")) {
    return {
      reply:
        "Our flagship facility is in Lahore, open 6 AM – 12 AM, 7 days a week. We deliver and install nationwide. Drop by anytime — or I can have a consultant call you back via WhatsApp.",
    };
  }
  if (has("event", "class", "course", "workshop", "training", "masterclass", "program")) {
    return {
      reply:
        "We run a premium course every 15 days — strength masterclasses, nutrition clinics and 8-week transformation blocks. Scroll to the Events section on this page for live countdowns, or tell me your goal and I'll recommend the right one. Seats are limited to keep coaching quality high.",
    };
  }
  if (has("human", "agent", "whatsapp", "call", "phone", "contact")) {
    return {
      reply: `You can reach our senior sales team directly on WhatsApp — tap the WhatsApp button on the page, or say “order” + product name and I'll generate an invoice you can send them in one tap.`,
    };
  }
  if (has("hi", "hello", "salam", "hey", "aoa", "assalam")) {
    return {
      reply:
        "Assalam-o-Alaikum and welcome to AW GYMS — Pakistan's luxury strength brand. I'm the official AW sales closer. Ask me for prices in PKR, honest product advice, or a deal — and when you're ready, I'll write your invoice and lock it in on WhatsApp. What are we building today?",
    };
  }

  // ---- Fallback ----------------------------------------------------------------
  const cheapest = [...active].sort((a, b) => a.pricePkr - b.pricePkr)[0];
  return {
    reply: `I've got you. I can quote any price in PKR, recommend equipment or supplements for your goal, and close your order right here with an invoice. ${cheapest ? `Quick inspiration: our ${cheapest.name.split("—")[0].trim()} starts at just ${fmt(cheapest.pricePkr)}.` : ""} What would you like to know?`,
  };
}
