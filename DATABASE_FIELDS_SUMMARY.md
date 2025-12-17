# Database Fields Summary

## Form Fields Being Sent

### Consumer Form Sends:
- `type`: "consumer"
- `name`: Combined from first_name + last_name
- `email`: Required
- `phone`: Optional
- `zip_code`: Required
- `favorite_brand`: Optional (dropdown selection)

### Brand Form Sends:
- `type`: "brand"
- `company_name`: Required
- `email`: Required
- `phone`: Optional
- `zip_code`: Required
- `brand_type`: Optional (dropdown selection)

## Updated Database Migration

The migration file `migrations/001_simplify_waitlist_CLEAN.sql` now includes ALL fields:

```sql
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'consumer' CHECK (type IN ('consumer', 'brand')),
ADD COLUMN IF NOT EXISTS name VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL,
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10) NULL,
ADD COLUMN IF NOT EXISTS favorite_brand VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS brand_type VARCHAR(50) NULL;
```

## Next Steps

1. **Run the updated migration in Supabase:**
   - Go to Supabase SQL Editor
   - Copy and paste the SQL from `migrations/001_simplify_waitlist_CLEAN.sql`
   - Execute it

2. **Verify the columns exist:**
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'waitlist'
   ORDER BY ordinal_position;
   ```

3. **Expected columns:**
   - `id` (primary key)
   - `email`
   - `type` (consumer/brand)
   - `name` (for consumer)
   - `company_name` (for brand)
   - `phone` (optional)
   - `zip_code`
   - `favorite_brand` (optional, for consumer)
   - `brand_type` (optional, for brand)
   - `created_at`

## Backend API Requirements

Your `/api/waitlist` endpoint should accept and store:
- All the fields listed above
- Handle the `type` field to distinguish consumer vs brand
- Store optional fields as NULL if not provided
