import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { videos } from "@db/schema";
import { eq } from "drizzle-orm";

export const videoRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(videos).orderBy(videos.order);
  }),

  active: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(videos).where(eq(videos.active, true)).orderBy(videos.order);
  }),

  bySection: publicQuery
    .input(z.object({ section: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(videos)
        .where(eq(videos.section, input.section));
    }),

  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1),
        url: z.string().min(1),
        section: z.string().optional(),
        active: z.boolean().default(true),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(videos).values(input);
      return { success: true, id: Number((result as unknown as { insertId: number }).insertId) };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        url: z.string().optional(),
        section: z.string().optional(),
        active: z.boolean().optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(videos).set(data).where(eq(videos.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(videos).where(eq(videos.id, input.id));
      return { success: true };
    }),
});
