# Instructions for AI Agent: Supabase Database Migration

## Context: What We Just Did

We simplified the Perkalate waitlist forms to optimize for entries:

1. **Simplified Consumer Waitlist Form**:
   - Added optional "name" field
   - Simplified copy and button text
   - Changed from single email field to email + optional name

2. **Created Brand Waitlist Form**:
   - New section with email + optional company name fields
   - Separate form for brand partners

3. **Updated Frontend Code**:
   - Modified `index.html` with both forms
   - Updated `script.js` to submit to `/api/waitlist` endpoint
   - Forms now send: `email`, `type` ('consumer' or 'brand'), optional `name`, optional `company_name`

4. **Database Migration Needed**:
   - The database schema needs to be updated to support these new fields
   - Currently the `waitlist` table only has `email` with a unique constraint
   - We need to add columns and update constraints

## Task: Update Supabase Database Schema

### Step 1: Navigate to Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select the Perkalate project (or the relevant project)
3. Click on "SQL Editor" in the left sidebar
4. Click "New query" or use the existing query editor

### Step 2: Execute the Migration SQL

Copy and paste the following SQL code into the SQL Editor, then execute it:

```sql
-- Add new columns to waitlist table
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'consumer' CHECK (type IN ('consumer', 'brand')),
ADD COLUMN IF NOT EXISTS name VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) NULL;

-- Remove old unique constraint on email alone
ALTER TABLE waitlist DROP CONSTRAINT IF EXISTS waitlist_email_key;

-- Add new composite unique constraint (allows same email for different types)
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_type_key ON waitlist(email, type);

-- Ensure created_at timestamp exists
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

### Step 3: Verify the Migration

After executing, run this verification query to confirm the changes:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'waitlist'
ORDER BY ordinal_position;
```

Expected result: You should see columns including:
- `id`
- `email`
- `name` (newly added)
- `type` (newly added, default 'consumer')
- `company_name` (newly added)
- `created_at` (newly added if it didn't exist)

### Step 4: Test the Constraint

Verify the new unique constraint works by checking the index:

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'waitlist' 
AND indexname = 'waitlist_email_type_key';
```

Expected: Should show the composite unique index on (email, type)

## What This Migration Does

- **Adds `name` column**: Stores optional consumer names
- **Adds `type` column**: Distinguishes 'consumer' vs 'brand' entries (defaults to 'consumer')
- **Adds `company_name` column**: Stores optional company names for brand entries
- **Updates unique constraint**: Changes from unique email to unique (email + type), allowing the same email to be used for both consumer and brand waitlists
- **Adds `created_at`**: Timestamp for when entries are created (if it doesn't already exist)

## Important Notes

- The migration uses `IF NOT EXISTS` and `IF EXISTS` clauses, so it's safe to run multiple times
- Existing rows in the `waitlist` table will automatically get `type = 'consumer'` for the default value
- The old unique constraint on email alone will be removed, allowing the same email for different types
- No data will be lost - this only adds columns and updates constraints

## Success Criteria

✅ Migration executes without errors
✅ Verification query shows all new columns exist
✅ Unique index is created on (email, type)
✅ Forms can now submit with the new fields

## Next Steps After Migration

Once the migration is complete:
1. The frontend forms are already updated and ready
2. The backend endpoint `/api/waitlist` should accept the new fields
3. Test by submitting both consumer and brand waitlist forms
4. Verify that the same email can be used for both types
