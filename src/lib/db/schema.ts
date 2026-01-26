import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  username: text('username').notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  createdAt: timestamp('created_at'),
});

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at'),
  docxPath: text('docx_path').notNull(),
  originalName: text('original_name'),
  fieldConfig: jsonb('field_config').default({}),
  updatedAt: timestamp('updated_at').defaultNow(),
  userId: integer('user_id').default(1),
});

export const templateFields = pgTable('template_fields', {
  id: uuid('id').primaryKey(),
  templateId: uuid('template_id').notNull(),
  name: text('name').notNull(),
});

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey(),
  templateId: uuid('template_id').notNull(),
  name: text('name').notNull(),
  docxPath: text('docx_path').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  data: jsonb('data').default({}).notNull(),
  pdfPath: text('pdf_path'),
  createdBy: text('created_by').default('system'),
  title: text('title'),
});