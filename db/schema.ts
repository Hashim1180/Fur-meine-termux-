import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  int,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["equipment", "supplements", "accessories"])
    .notNull()
    .default("equipment"),
  description: text("description"),
  pricePkr: int("price_pkr").notNull().default(0),
  compareAtPkr: int("compare_at_pkr"),
  mediaType: mysqlEnum("media_type", ["image", "video", "model3d"])
    .notNull()
    .default("image"),
  mediaUrl: varchar("media_url", { length: 1024 }),
  embedCode: text("embed_code"),
  badge: varchar("badge", { length: 64 }),
  stock: int("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  sortOrder: int("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const events = mysqlTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).default("Workshop"),
  location: varchar("location", { length: 255 }).default(
    "AW Flagship Facility — Lahore",
  ),
  startAt: timestamp("start_at").notNull(),
  seats: int("seats").notNull().default(30),
  pricePkr: int("price_pkr").notNull().default(0),
  status: mysqlEnum("status", ["upcoming", "archived"])
    .notNull()
    .default("upcoming"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 128 }).primaryKey(),
  value: text("value"),
});
