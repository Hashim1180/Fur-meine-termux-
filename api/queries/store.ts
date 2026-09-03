import { asc, eq } from "drizzle-orm";
import { getDb } from "./connection";
import { events, products, settings } from "@db/schema";

export async function listProducts(includeInactive = false) {
  const db = getDb();
  const rows = await db
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder), asc(products.id));
  return includeInactive ? rows : rows.filter((r) => r.active);
}

export async function listEvents() {
  const db = getDb();
  return db.select().from(events).orderBy(asc(events.startAt));
}

export async function getSettingsMap(): Promise<Record<string, string>> {
  const db = getDb();
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
}

export async function setSetting(key: string, value: string) {
  const db = getDb();
  await db
    .insert(settings)
    .values({ key, value })
    .onDuplicateKeyUpdate({ set: { value } });
}

export async function getProductById(id: number) {
  const db = getDb();
  const rows = await db.select().from(products).where(eq(products.id, id));
  return rows[0] ?? null;
}

export { products, events, settings };
