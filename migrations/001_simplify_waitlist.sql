-- Migration: Simplify Waitlist Forms
-- Adds support for simplified consumer and brand waitlist forms

-- Option 1: Single table with type field (recommended based on existing constraint)
-- Add type and company_name columns to existing waitlist table
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'consumer' CHECK (type IN ('consumer', 'brand')),
ADD COLUMN IF NOT EXISTS name VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) NULL;

-- Update unique constraint to allow same email for different types
-- Remove old constraint if exists (backup first if needed)
ALTER TABLE waitlist DROP CONSTRAINT IF EXISTS waitlist_email_key;

-- Add composite unique constraint (email + type)
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_type_key ON waitlist(email, type);

-- Ensure created_at exists
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Alternative Option 2: Separate brand_waitlist table (uncomment if preferred)
/*
CREATE TABLE IF NOT EXISTS brand_waitlist (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    company_name VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT brand_waitlist_email_key UNIQUE (email)
);
*/
