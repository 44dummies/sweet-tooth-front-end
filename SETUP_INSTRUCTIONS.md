# Database Setup Instructions

Your menu page is empty because the Supabase products table hasn't been populated yet.

## Steps to Fix:

### 1. Open Supabase SQL Editor
- Go to: https://supabase.com/dashboard/project/mwegyqxxeeakfjrgcfrh/sql/new

### 2. Run the Schema (if not already done)
- Copy the entire contents of `supabase-schema.sql`
- Paste into the SQL Editor
- Click **Run** (or press `Ctrl+Enter`)
- Wait for "Success. No rows returned"

### 3. Run the Seed Data
- Copy the entire contents of `database-seed.sql`
- Paste into the SQL Editor
- Click **Run** (or press `Ctrl+Enter`)
- You should see "Success" with row counts

### 4. Verify Data
Run this query in the SQL Editor:
```sql
SELECT COUNT(*) FROM products;
```
You should see: **38 rows**

### 5. Refresh Your App
- Go to http://localhost:8082/menu
- You should now see 38 products!

## Troubleshooting

If you see **authentication errors**:
1. Make sure you're logged in to your app
2. Check that RLS policies are enabled
3. Try running: `SELECT * FROM products;` in SQL Editor to verify data exists

If **images don't load**:
- The seed uses Unsplash URLs which should work fine
- If needed, you can upload your own images to Supabase Storage and update the `image_url` column

## Quick Test
Open browser console (F12) on the menu page and check for:
- `🔍 Fetching products from Supabase...`
- `✅ Found X products in database`

If you see `⚠️ No products in database`, the seed hasn't been run yet.
