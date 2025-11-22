# Apply Database Migration

## Quick Setup Instructions

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/mokugiiuazqbdvxlbbun
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase/migrations/20251122000001_complete_database_setup.sql`
5. Paste it into the SQL editor
6. Click "Run" button
7. Wait for the migration to complete (should take 5-10 seconds)

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
cd "/home/dzaddy/Documents/sweet-tooth frontend"
supabase db push
```

## What This Migration Creates

### Tables Created:
1. **products** - Product catalog (cakes, pastries, desserts)
2. **orders** - Customer orders with delivery info
3. **order_items** - Items in each order
4. **custom_orders** - Custom cake orders
5. **profiles** - User profiles
6. **reviews** - Customer reviews and ratings
7. **visitor_logs** - Analytics and visitor tracking
8. **page_views** - Page view analytics
9. **favorites** - User wishlist
10. **customer_messages** - Contact form messages
11. **conversations** - Customer support chats
12. **conversation_messages** - Chat messages
13. **payments** - Payment records
14. **notifications** - User notifications
15. **customer_data** - Password reset data
16. **password_history** - Password history
17. **availability_calendar** - Booking availability
18. **gift_cards** - Gift card system
19. **gift_card_transactions** - Gift card usage
20. **cake_size_guide** - Cake sizing information
21. **delivery_zones** - Delivery zone pricing

### Security Features:
- Row Level Security (RLS) enabled on all tables
- Public can view products, reviews, guides
- Users can only access their own data
- Admin policies for management
- Automatic profile creation on signup

### Sample Data Included:
- 6 sample products
- Cake size guide (5 sizes)
- 3 delivery zones

## Verification

After running the migration, verify it worked:

1. Go to Supabase Dashboard → Database → Tables
2. You should see all 21 tables listed
3. Check the "products" table - should have 6 sample items
4. Check the "cake_size_guide" table - should have 5 entries

## Troubleshooting

If you see errors:

1. **"relation already exists"** - This is OK, it means tables already exist
2. **"permission denied"** - Make sure you're using the correct Supabase project
3. **"policy already exists"** - This is OK, policies already exist

The migration uses `IF NOT EXISTS` clauses, so it's safe to run multiple times.

## Next Steps

Once the migration is complete:

1. Reload your application at http://localhost:8081/
2. Check the browser console - database errors should be gone
3. Try these features:
   - Browse menu items
   - Add items to favorites (requires login)
   - Submit a custom order
   - View cake size guide
   - Check delivery zones

## Admin Setup

To make a user an admin:

1. Register a user account in your app
2. Go to Supabase Dashboard → SQL Editor
3. Run this query (replace with your email):

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

4. Reload the app - you'll have admin access to:
   - Inventory Management
   - Order Management
   - Customer Messages
   - Analytics Dashboard
