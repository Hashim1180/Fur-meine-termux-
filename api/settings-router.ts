import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { siteSettings } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(siteSettings);
  }),

  get: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, input.key))
        .limit(1);
      return result[0] ?? null;
    }),

  update: adminQuery
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, input.key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(siteSettings)
          .set({ value: input.value })
          .where(eq(siteSettings.key, input.key));
      } else {
        await db.insert(siteSettings).values(input);
      }
      return { success: true };
    }),
});
