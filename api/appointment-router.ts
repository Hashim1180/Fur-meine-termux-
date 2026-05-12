import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { appointments } from "@db/schema";
import { eq } from "drizzle-orm";

export const appointmentRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(appointments).orderBy(appointments.createdAt);
  }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        date: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(appointments).values({
        ...input,
        status: "pending",
      });
      return { success: true, id: Number((result as unknown as { insertId: number }).insertId) };
    }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(appointments)
        .set({ status: input.status })
        .where(eq(appointments.id, input.id));
      return { success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(appointments).where(eq(appointments.id, input.id));
      return { success: true };
    }),
});
