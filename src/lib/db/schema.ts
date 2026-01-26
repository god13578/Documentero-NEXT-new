import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  jsonb, 
  boolean, 
  integer 
} from "drizzle-orm/pg-core";

/* ================= USERS ================= */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= TEMPLATES ================= */
export const templates = pgTable("templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  docxPath: text("docx_path").notNull(), // ✅ ตรงกับฐานข้อมูลหลังเพิ่มคอลัมน์
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= TEMPLATE FIELDS ================= */
export const templateFields = pgTable("template_fields", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id").notNull(),
  name: text("name").notNull(),
  // New fields - make them optional for backward compatibility
  fieldType: text("field_type").default("text"), // text, date, fulldate, select, multiselect
  fieldOptions: jsonb("field_options"), // สำหรับ select/multiselect options
  fieldDependencies: jsonb("field_dependencies"), // สำหรับ dynamic fields
  defaultValue: text("default_value"),
  isRequired: boolean("is_required").default(false),
  fieldOrder: integer("field_order").default(0),
});

/* ================= DOCUMENTS ================= */
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey(),
  templateId: uuid("template_id").notNull(),
  createdBy: uuid("created_by").notNull(),
  title: text("title").notNull(),
  data: jsonb("data").notNull(),
  docxPath: text("docx_path").notNull(),
  pdfPath: text("pdf_path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
