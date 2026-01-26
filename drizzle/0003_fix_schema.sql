-- Add missing columns if they don't exist
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS field_config jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

-- Create template_fields table if it doesn't exist
CREATE TABLE IF NOT EXISTS template_fields (
    id SERIAL PRIMARY KEY,
    template_id TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT DEFAULT 'text' NOT NULL,
    options jsonb,
    default_value TEXT,
    is_required BOOLEAN DEFAULT false,
    field_order INTEGER DEFAULT 0,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Add missing columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS docx_path TEXT,
ADD COLUMN IF NOT EXISTS pdf_path TEXT,
ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'system',
ADD COLUMN IF NOT EXISTS title TEXT;
