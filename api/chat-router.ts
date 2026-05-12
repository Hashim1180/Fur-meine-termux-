import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { chatMessages } from "@db/schema";
import { eq } from "drizzle-orm";

const AI_RESPONSES: Record<string, string> = {
  default: "Welcome to AW GYMS! I'm your AI fitness assistant. How can I help you today? I can help with workout plans, product recommendations, pricing, or booking appointments. You can also reach",
  workout: "Our expert trainers can design personalized workout plans based on your goals. We offer strength training, cardio, HIIT, and functional fitness programs. Would you like to book a consul",
  price: "Our membership starts from Rs. 5,000/month. Personal training packages start at Rs. 15,000/month. Equipment prices vary - check our Products section for detailed pricing. What specific p",
  product: "We have premium gym equipment including dumbbells, bench presses, treadmills, ellipticals, and supplements like whey protein and creatine. All products are available in our online stor",
  supplement: "We stock Optimum Nutrition Gold Standard Whey, Kevin Levrone Creatine, and other premium supplements. All are authentic and certified. Need help choosing the right supplement for yo",
  appointment: "I can help you book an appointment! Please provide your name, preferred date, and what you'd like to discuss (training, nutrition, equipment). You can also WhatsApp us directly at",
  gym: "AW GYMS features state-of-the-art equipment, expert trainers, nutrition counseling, and a premium atmosphere. Located in Pakistan with facilities designed for serious fitness enthusiasts.",
  hi: "Hello! Welcome to AW GYMS! I'm your AI assistant. I can help you with workout plans, product info, pricing, or book appointments. What brings you here today?",
  hello: "Hi there! Ready to transform your fitness journey? I'm here to help with workout advice, product recommendations, or booking sessions. What do you need?",
  whatsapp: "You can reach us directly on WhatsApp at +92 349 7814918 for instant responses, booking, and sales inquiries. Click the WhatsApp button anytime!",
  buy: "Interested in purchasing? You can browse all our products in the Products section. For bulk orders or special requests, contact us on WhatsApp at +92 349 7814918 for the best deals.",
  diet: "Nutrition is 70% of your results! We offer personalized meal plans and supplement guidance. Our trainers can create a diet plan tailored to your body type and goals. Book a nutrition cons",
  trainer: "Our certified trainers specialize in strength & conditioning, weight loss, muscle building, and sports performance. Personal training starts at Rs. 15,000/month. Want to meet a trainer",
  timing: "AW GYMS is open 5 AM to 11 PM daily, including weekends. We also offer 24/7 access for premium members. What time works best for your workouts?",
  membership: "We offer Monthly (Rs. 5,000), Quarterly (Rs. 13,000), Half-Yearly (Rs. 24,000), and Yearly (Rs. 42,000) memberships. All include full facility access. Corporate and student discount",
};

function getAIResponse(message: string): string {
  const lowerMsg = message.toLowerCase();
  
  for (const [key, response] of Object.entries(AI_RESPONSES)) {
    if (lowerMsg.includes(key)) return response;
  }
  
  if (lowerMsg.includes("thank")) return "You're welcome! Keep pushing your limits at AW GYMS! 💪";
  if (lowerMsg.includes("bye")) return "See you at the gym! Stay strong! 💪🔥";
  if (lowerMsg.includes("help")) return AI_RESPONSES.default;
  
  return "I'm here to help with anything fitness-related at AW GYMS! Ask me about workouts, products, supplements, pricing, or booking appointments. You can also WhatsApp us at +92 349 7814918 for";
}

export const chatRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(chatMessages).orderBy(chatMessages.createdAt);
  }),

  send: publicQuery
    .input(
      z.object({
        userId: z.string().optional(),
        name: z.string().optional(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const response = getAIResponse(input.message);
      
      const result = await db.insert(chatMessages).values({
        ...input,
        response,
      });
      
      return { 
        success: true, 
        id: Number((result as unknown as { insertId: number }).insertId),
        response 
      };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(chatMessages).where(eq(chatMessages.id, input.id));
      return { success: true };
    }),
});
