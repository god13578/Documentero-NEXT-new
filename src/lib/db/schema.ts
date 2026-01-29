import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
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

// --- Template Fields ---
export const templateFields = pgTable('template_fields', {
  id: uuid('id').defaultRandom().primaryKey(),
  templateId: uuid('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
});

// --- Documents ---
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

// --- Relations ---
export const usersRelations = relations(users, ({ many }) => ({
  templates: many(templates),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  author: one(users, {
    fields: [templates.userId],
    references: [users.id],
  }),
  fields: many(templateFields),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  template: one(templates, {
    fields: [documents.templateId],
    references: [templates.id],
  }),
}));