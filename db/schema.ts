import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const conversations = pgTable("conversations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  customerId: varchar("customer_id", { length: 64 }).notNull(),
  messages: jsonb("messages").notNull().default([]),
  status: varchar({ length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id),
  rating: integer().notNull(),
  comment: text(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const kbDocuments = pgTable("kb_documents", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  tags: text().array().notNull().default([]),
  embedding: varchar("embedding", { length: 16384 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Message = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type Conversation = typeof conversations.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type KbDocument = typeof kbDocuments.$inferSelect;
