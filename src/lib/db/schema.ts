import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb
} from "drizzle-orm/pg-core";

/**
 * users
 * - ใช้ login
 * - ทุกคนสิทธิ์เท่ากัน
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * templates
 * - เก็บไฟล์ DOCX ต้นแบบ
 */
export const templates = pgTable("templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  docxPath: text("docx_path").notNull(),
  defaultFont: text("default_font").default("TH Sarabun New"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * template_fields
 * - field ที่ดึงจาก {{ }} ใน DOCX
 */
export const templateFields = pgTable("template_fields", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id")
    .references(() => templates.id)
    .notNull(),
  fieldKey: text("field_key").notNull(),     // เช่น subject
  fieldLabel: text("field_label").notNull(), // เรื่อง
  fieldType: text("field_type").notNull(),   // text | textarea | date
  orderIndex: text("order_index"),
});

/**
 * documents
 * - เอกสารที่ถูกสร้างแล้ว (history)
 */
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id")
    .references(() => templates.id)
    .notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  data: jsonb("data").notNull(),              // ค่าที่กรอกใน form
  docxPath: text("docx_path").notNull(),
  pdfPath: text("pdf_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
