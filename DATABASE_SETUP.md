# Database Setup Guide

## 🚨 CRITICAL: SQL Migration Required

Your application is experiencing errors because the database schema needs to be updated. Follow these steps **immediately**:

---

## Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in with your account
3. Select your **Sweet Tooth** project

---

## Step 2: Run the SQL Migration

1. In the Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query** button
3. Open the file `database-realtime-analytics.sql` from your project
4. **Copy the ENTIRE contents** of that file
5. **Paste it** into the SQL Editor
6. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

⏱️ **This will take 10-20 seconds to complete**

---

## Step 3: Verify the Migration

After running the migration, verify everything worked:

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ `orders`
   - ✅ `order_items`
   - ✅ `products`
   - ✅ `reviews`
   - ✅ `custom_orders`
   - ✅ `profiles`
   - ✅ `admin_notifications`
   - ✅ `conversations` *(NEW)*
   - ✅ `conversation_messages` *(NEW)*

3. Click on any table and check:
   - The table has data (if applicable)
   - No error messages appear
   - You can view rows

---

## Step 4: Enable Realtime

1. Go to **Database** → **Replication** in the left sidebar
2. Find the publication named `supabase_realtime`
3. Ensure these tables are checked:
   - ✅ orders
   - ✅ order_items
   - ✅ products
   - ✅ reviews
   - ✅ custom_orders
   - ✅ profiles
   - ✅ admin_notifications
   - ✅ conversations
   - ✅ conversation_messages

4. Click **Save** if you made any changes

---

## What This Migration Does

### 🔧 Fixes Critical Errors
- ❌ **Before**: `permission denied for table users`
- ✅ **After**: Uses email-based authentication (no `users` table dependency)

### 🗑️ Data Cleanup
- Removes all products with price below 500 KSH
- Clears product image URLs (frontend now uses Unsplash)

### 💬 New Features
- **Live Chat System**: Customers can chat with admin in real-time
- **Conversations Table**: Tracks all customer conversations
- **Messaging Table**: Stores all chat messages
- **Read Receipts**: Shows when messages are read
- **Unread Counters**: Badge notifications for new messages

### 🔐 Security (RLS Policies)
- Customers can only view their own orders, conversations, and messages
- Admin (muindidamian@gmail.com) has full access to everything
- All policies use email-based authentication instead of user_id

### 📊 Performance
- 20+ optimized indexes for fast queries
- Materialized views for analytics
- Real-time subscriptions for instant updates

---

## Troubleshooting

### Error: "relation already exists"
This is normal if you've run parts of the migration before. The script uses `IF NOT EXISTS` to handle this safely.

### Error: "permission denied"
Make sure you're logged in as the project owner or have proper admin permissions in Supabase.

### Chat not working
1. Verify `conversations` and `conversation_messages` tables exist
2. Check that realtime is enabled for both tables
3. Refresh your application (Ctrl+Shift+R)

### Orders still showing permission errors
1. Double-check the SQL ran completely (scroll to bottom of output)
2. Verify you're logged in with the correct email
3. Try signing out and signing back in

---

## Test the Live Chat

### As a Customer:
1. Sign in to your account at https://sweettooth.com
2. Click the floating chat button (bottom right)
3. Send a test message: "Testing live chat"
4. You should see a welcome message from Sweet Tooth Team

### As Admin:
1. Sign in with admin account (muindidamian@gmail.com)
2. Go to Admin Dashboard → Messages tab
3. You should see the customer's conversation
4. Reply to the message
5. Customer should receive it instantly

---

## Admin Features Now Available

After migration, admin dashboard will have:

1. **📧 Messages Tab**: View all customer conversations
2. **🔔 Real-time Notifications**: See new orders/messages instantly
3. **📊 Analytics**: Daily sales summaries and performance metrics
4. **📦 Order Management**: Full access to all orders (no permission errors)
5. **💬 Live Chat**: Reply to customers in real-time

---

## Next Steps After Migration

1. ✅ Run the SQL migration (above)
2. ✅ Refresh your application
3. ✅ Test the live chat feature
4. ✅ Verify admin dashboard loads without errors
5. ✅ Deploy to production

---

## Support

If you encounter any issues:
1. Check the browser console for specific error messages
2. Verify the SQL migration completed successfully (no red errors in Supabase)
3. Ensure you're using the latest code from GitHub
4. Try clearing browser cache and cookies

**Last Updated**: November 25, 2025  
**Migration Version**: 3.0  
**Required Supabase Plan**: Free tier or higher
