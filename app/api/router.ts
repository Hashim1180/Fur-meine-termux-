import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  events,
  getSettingsMap,
  listEvents,
  listProducts,
  products,
  setSetting,
} from "./queries/store";
import { sha256, signAdminToken, verifyAdminToken } from "./auth";
import { handleChat } from "./chat";

const adminProcedure = publicQuery.use(({ ctx, next }) => {
  const auth = ctx.req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!verifyAdminToken(token)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid admin session" });
  }
  return next();
});

const productInput = z.object({
  name: z.string().min(1),
  category: z.enum(["equipment", "supplements", "accessories"]),
  description: z.string().optional().default(""),
  pricePkr: z.number().int().min(0),
  compareAtPkr: z.number().int().min(0).nullable().optional(),
  mediaType: z.enum(["image", "video", "model3d"]).default("image"),
  mediaUrl: z.string().optional().default(""),
  embedCode: z.string().nullable().optional(),
  badge: z.string().nullable().optional(),
  stock: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

const eventInput = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  category: z.string().default("Workshop"),
  location: z.string().default("AW Flagship Facility — Lahore"),
  startAt: z.coerce.date(),
  seats: z.number().int().min(0).default(30),
  pricePkr: z.number().int().min(0).default(0),
  status: z.enum(["upcoming", "archived"]).default("upcoming"),
});

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  store: createRouter({
    products: publicQuery.query(async () => {
      const rows = await listProducts();
      return rows;
    }),
    events: publicQuery.query(async () => {
      const rows = await listEvents();
      const now = Date.now();
      // auto-archive: countdown hit zero
      const db = getDb();
      for (const e of rows) {
        if (e.status === "upcoming" && new Date(e.startAt).getTime() <= now) {
          await db.update(events).set({ status: "archived" }).where(eq(events.id, e.id));
          e.status = "archived";
        }
      }
      return rows.sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      );
    }),
    settings: publicQuery.query(async () => {
      const s = await getSettingsMap();
      return {
        whatsappNumber: s.whatsapp_number || "923497814918",
        usdRate: parseFloat(s.usd_rate || "281"),
        aedRate: parseFloat(s.aed_rate || "76.6"),
        announcement: s.announcement || "",
      };
    }),
    chat: publicQuery
      .input(
        z.object({
          message: z.string().min(1).max(2000),
          history: z
            .array(z.object({ role: z.string(), content: z.string() }))
            .max(20)
            .default([]),
        }),
      )
      .mutation(async ({ input }) => {
        return handleChat(input.message, input.history);
      }),
  }),

  admin: createRouter({
    login: publicQuery
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input }) => {
        const s = await getSettingsMap();
        const user = s.admin_username || "admin";
        const hash = s.admin_password_hash || "";
        if (input.username === user && sha256(input.password) === hash) {
          return { token: signAdminToken(user) };
        }
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }),

    verify: adminProcedure.query(() => ({ ok: true })),

    products: adminProcedure.query(async () => {
      return listProducts(true);
    }),

    createProduct: adminProcedure
      .input(productInput)
      .mutation(async ({ input }) => {
        const db = getDb();
        await db.insert(products).values(input);
        return { ok: true };
      }),

    updateProduct: adminProcedure
      .input(z.object({ id: z.number(), data: productInput.partial() }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await db.update(products).set(input.data).where(eq(products.id, input.id));
        return { ok: true };
      }),

    deleteProduct: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await db.delete(products).where(eq(products.id, input.id));
        return { ok: true };
      }),

    events: adminProcedure.query(async () => {
      const db = getDb();
      return db.select().from(events).orderBy(asc(events.startAt));
    }),

    createEvent: adminProcedure.input(eventInput).mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(events).values(input);
      return { ok: true };
    }),

    updateEvent: adminProcedure
      .input(z.object({ id: z.number(), data: eventInput.partial() }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await db.update(events).set(input.data).where(eq(events.id, input.id));
        return { ok: true };
      }),

    deleteEvent: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = getDb();
        await db.delete(events).where(eq(events.id, input.id));
        return { ok: true };
      }),

    settings: adminProcedure.query(async () => {
      const s = await getSettingsMap();
      return {
        whatsappNumber: s.whatsapp_number || "",
        usdRate: s.usd_rate || "",
        aedRate: s.aed_rate || "",
        announcement: s.announcement || "",
      };
    }),

    updateSettings: adminProcedure
      .input(
        z.object({
          whatsappNumber: z.string().optional(),
          usdRate: z.string().optional(),
          aedRate: z.string().optional(),
          announcement: z.string().optional(),
          newPassword: z.string().min(6).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        if (input.whatsappNumber !== undefined)
          await setSetting("whatsapp_number", input.whatsappNumber);
        if (input.usdRate !== undefined) await setSetting("usd_rate", input.usdRate);
        if (input.aedRate !== undefined) await setSetting("aed_rate", input.aedRate);
        if (input.announcement !== undefined)
          await setSetting("announcement", input.announcement);
        if (input.newPassword)
          await setSetting("admin_password_hash", sha256(input.newPassword));
        return { ok: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
