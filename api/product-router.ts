import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { products } from "@db/schema";
import { eq } from "drizzle-orm";

export const productRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(products).orderBy(products.createdAt);
  }),

  featured: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(products).where(eq(products.featured, true));
  }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);
      return result[0] ?? null;
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.string().min(1),
        image: z.string().optional(),
        category: z.string().optional(),
        inStock: z.boolean().default(true),
        featured: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(products).values(input);
      return { success: true, id: Number((result as unknown as { insertId: number }).insertId) };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        image: z.string().optional(),
        category: z.string().optional(),
        inStock: z.boolean().optional(),
        featured: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(products).set(data).where(eq(products.id, id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),
});
