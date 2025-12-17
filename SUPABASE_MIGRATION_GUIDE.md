# Supabase Migration Guide

## Quick Steps to Apply Database Changes

Yes, you need to run the SQL migration in Supabase. Here's how:

### Option 1: Using Supabase Dashboard (Easiest)

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. **Navigate to SQL Editor**:
   - Click on "SQL Editor" in the left sidebar
   - Or go to: `https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql/new`

3. **Copy and paste the migration SQL**:
   - Open the file: `migrations/001_simplify_waitlist.sql`
   - Copy all the SQL code (lines 1-20, skip the commented alternative)
   - Paste it into the SQL Editor

4. **Run the migration**:
   - Click "Run" or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
   - You should see "Success. No rows returned"

### Option 2: Using Supabase CLI (If you have it set up)

```bash
# If you have Supabase CLI installed
supabase db push migrations/001_simplify_waitlist.sql
```

## What the Migration Does

The migration will:
1. ✅ Add `name` column (for consumer names)
2. ✅ Add `type` column (to distinguish 'consumer' vs 'brand')
3. ✅ Add `company_name` column (for brand company names)
4. ✅ Remove the old unique constraint on email alone
5. ✅ Add new unique constraint on (email + type) - allows same email for different types
6. ✅ Ensure `created_at` timestamp exists

## Verify It Worked

After running the migration, you can verify by running this in SQL Editor:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'waitlist'
ORDER BY ordinal_position;
```

You should see:
- `id`
- `email`
- `name` (new)
- `type` (new)
- `company_name` (new)
- `created_at`

## Important Notes

⚠️ **Before running**: The migration uses `IF NOT EXISTS` and `IF EXISTS` clauses, so it's safe to run multiple times. However, if you have existing data, make sure:
- Existing rows will get `type = 'consumer'` by default
- The old unique constraint will be removed (allowing same email for different types)

## Troubleshooting

If you get an error about the constraint not existing:
- That's okay! The `DROP CONSTRAINT IF EXISTS` handles this
- Just continue with the rest of the migration

If you get a permission error:
- Make sure you're using the correct database role
- Check that you have ALTER TABLE permissions

## Next Steps

After the migration is complete:
1. ✅ Your forms will work immediately
2. ✅ Consumer submissions will have `type = 'consumer'`
3. ✅ Brand submissions will have `type = 'brand'`
4. ✅ Same email can be used for both consumer and brand waitlists
