-- Copy and paste this entire block into Supabase SQL Editor

ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'consumer' CHECK (type IN ('consumer', 'brand')),
ADD COLUMN IF NOT EXISTS name VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) NULL;

ALTER TABLE waitlist DROP CONSTRAINT IF EXISTS waitlist_email_key;

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_type_key ON waitlist(email, type);

ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
