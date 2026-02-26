import {
  pgTable,
  text,
  timestamp,
  jsonb,
  json,     // 👈 เพิ่ม json แล้ว
  uuid,
  varchar,  // 👈 เพิ่ม varchar แล้ว
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Users Table ---
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- Templates Table ---
export const templates = pgTable('templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  docxPath: text('docx_path').notNull(),
  originalName: text('original_name'),
  fieldConfig: jsonb('field_config').default({}),
  updatedAt: timestamp('updated_at').defaultNow(),
  userId: uuid('user_id').references(() => users.id),
});

// --- Template Fields Table (ช่องกรอกข้อมูล) ---
export const templateFields = pgTable("template_fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id").references(() => templates.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  label: varchar("label", { length: 255 }),
  type: varchar("type", { length: 50 }).default('text'), // ประเภท (text, select, multiselect, date-th, date-full)
  options: json("options"), // เก็บตัวเลือกของ Dropdown/Checkbox (เช่น ["ผ่าน", "ไม่ผ่าน"])
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Documents Table (เอกสารที่สร้างแล้ว) ---
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  templateId: uuid('template_id').notNull().references(() => templates.id),
  name: text('name').notNull(),
  docxPath: text('docx_path').notNull(),
  pdfPath: text('pdf_path'),
  data: jsonb('data').default({}).notNull(),
  title: text('title'),
  createdBy: text('created_by').default('system'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// --- Relations (การเชื่อมความสัมพันธ์) ---
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  templates: many(templates),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  author: one(users, {
    fields: [templates.userId],
    references: [users.id],
  }),
  fields: many(templateFields), // Template มีได้หลาย Fields
  documents: many(documents),
}));

// 🌟 เพิ่มอันนี้เข้ามา เพื่อให้ระบบดึงข้อมูลกลับไปหา Template ได้ถูกต้อง
export const templateFieldsRelations = relations(templateFields, ({ one }) => ({
  template: one(templates, {
    fields: [templateFields.templateId],
    references: [templates.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  template: one(templates, {
    fields: [documents.templateId],
    references: [templates.id],
  }),
}));