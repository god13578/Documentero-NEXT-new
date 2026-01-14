import {
  pgTable,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at"),
});

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at"),
});

export const templateFields = pgTable("template_fields", {
  id: uuid("id").primaryKey(),
  templateId: uuid("template_id").notNull(),
  name: text("name").notNull(),
});

/* TYPES */
export type Template = InferSelectModel<typeof templates>;
export type NewTemplate = InferInsertModel<typeof templates>;

export type TemplateField = InferSelectModel<typeof templateFields>;
export type NewTemplateField = InferInsertModel<typeof templateFields>;
