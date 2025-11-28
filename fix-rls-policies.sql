-- ============================================================================
-- Sweet Tooth Bakery - RLS Policy Fix
-- Run this in Supabase SQL Editor to fix "permission denied for table users" error
-- ============================================================================

-- ============================================================================
-- DROP ALL EXISTING POLICIES FIRST
-- ============================================================================

-- Orders Policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;

-- Order Items Policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Admin full access to order items" ON order_items;

-- Products Policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;

-- Reviews Policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Admin full access to reviews" ON reviews;

-- Custom Orders Policies
DROP POLICY IF EXISTS "Users can view own custom orders" ON custom_orders;
DROP POLICY IF EXISTS "Users can insert custom orders" ON custom_orders;
DROP POLICY IF EXISTS "Users can update own custom orders" ON custom_orders;
DROP POLICY IF EXISTS "Admin full access to custom orders" ON custom_orders;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;

-- Admin Notifications Policies
DROP POLICY IF EXISTS "Admin can view notifications" ON admin_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Admin can update notifications" ON admin_notifications;

-- Conversations Policies
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Admin can view all conversations" ON conversations;
DROP POLICY IF EXISTS "Admin can update all conversations" ON conversations;

-- Conversation Messages Policies
DROP POLICY IF EXISTS "Users can view own messages" ON conversation_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON conversation_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON conversation_messages;
DROP POLICY IF EXISTS "Admin can view all messages" ON conversation_messages;
DROP POLICY IF EXISTS "Admin can insert messages" ON conversation_messages;
DROP POLICY IF EXISTS "Admin can update all messages" ON conversation_messages;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on admin_notifications if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_notifications') THEN
    ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Enable RLS on conversations if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'conversations') THEN
    ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Enable RLS on conversation_messages if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'conversation_messages') THEN
    ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================================
-- ORDERS POLICIES (using auth.jwt() instead of auth.users)
-- ============================================================================

-- Users can view their own orders by email
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (customer_email = auth.jwt() ->> 'email');

-- Users can insert their own orders
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT
  WITH CHECK (customer_email = auth.jwt() ->> 'email');

-- Users can update their own orders
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE
  USING (customer_email = auth.jwt() ->> 'email');

-- Admins have full access to all orders
CREATE POLICY "Admin full access to orders" ON orders
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- ============================================================================
-- ORDER ITEMS POLICIES
-- ============================================================================

-- Users can view items from their own orders
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_email = auth.jwt() ->> 'email'
    )
  );

-- Users can insert items to their own orders
CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_email = auth.jwt() ->> 'email'
    )
  );

-- Admins have full access to all order items
CREATE POLICY "Admin full access to order items" ON order_items
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- ============================================================================
-- PRODUCTS POLICIES
-- ============================================================================

-- Anyone can view products (public access)
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT
  USING (true);

-- Only admins can manage products
CREATE POLICY "Admin can manage products" ON products
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- ============================================================================
-- REVIEWS POLICIES
-- ============================================================================

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT
  USING (true);

-- Users can insert their own reviews
CREATE POLICY "Users can insert own reviews" ON reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins have full access to all reviews
CREATE POLICY "Admin full access to reviews" ON reviews
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- ============================================================================
-- CUSTOM ORDERS POLICIES
-- ============================================================================

-- Users can view their own custom orders
CREATE POLICY "Users can view own custom orders" ON custom_orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert custom orders
CREATE POLICY "Users can insert custom orders" ON custom_orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own custom orders
CREATE POLICY "Users can update own custom orders" ON custom_orders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins have full access to all custom orders
CREATE POLICY "Admin full access to custom orders" ON custom_orders
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- All authenticated users can view all profiles
CREATE POLICY "Authenticated users can view profiles" ON profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin can delete profiles
CREATE POLICY "Admin can delete profiles" ON profiles
  FOR DELETE
  USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- ============================================================================
-- ADMIN NOTIFICATIONS POLICIES (if table exists)
-- ============================================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'admin_notifications') THEN
    -- Only admins can view notifications
    EXECUTE 'CREATE POLICY "Admin can view notifications" ON admin_notifications
      FOR SELECT
      USING (auth.jwt() ->> ''email'' = ''muindidamian@gmail.com'')';

    -- System can insert notifications
    EXECUTE 'CREATE POLICY "System can insert notifications" ON admin_notifications
      FOR INSERT
      WITH CHECK (true)';

    -- Admins can update notifications
    EXECUTE 'CREATE POLICY "Admin can update notifications" ON admin_notifications
      FOR UPDATE
      USING (auth.jwt() ->> ''email'' = ''muindidamian@gmail.com'')';
  END IF;
END $$;

-- ============================================================================
-- CONVERSATIONS POLICIES (if table exists)
-- ============================================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'conversations') THEN
    -- Users can view their own conversations by email
    EXECUTE 'CREATE POLICY "Users can view own conversations" ON conversations
      FOR SELECT
      USING (customer_email = auth.jwt() ->> ''email'')';

    -- Users can insert their own conversations
    EXECUTE 'CREATE POLICY "Users can insert own conversations" ON conversations
      FOR INSERT
      WITH CHECK (customer_email = auth.jwt() ->> ''email'')';

    -- Users can update their own conversations
    EXECUTE 'CREATE POLICY "Users can update own conversations" ON conversations
      FOR UPDATE
      USING (customer_email = auth.jwt() ->> ''email'')';

    -- Admin can view all conversations
    EXECUTE 'CREATE POLICY "Admin can view all conversations" ON conversations
      FOR SELECT
      USING (auth.jwt() ->> ''email'' = ''muindidamian@gmail.com'')';

    -- Admin can update all conversations
    EXECUTE 'CREATE POLICY "Admin can update all conversations" ON conversations
      FOR UPDATE
      USING (auth.jwt() ->> ''email'' = ''muindidamian@gmail.com'')';
  END IF;
END $$;

-- ============================================================================
-- CONVERSATION MESSAGES POLICIES (if table exists)
-- ============================================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'conversation_messages') THEN
    -- Users can view messages in their own conversations
    EXECUTE 'CREATE POLICY "Users can view own messages" ON conversation_messages
      FOR SELECT
      USING (customer_email = auth.jwt() ->> ''email'')';

    -- Users can insert messages in their own conversations
    EXECUTE 'CREATE POLICY "Users can insert own messages" ON conversation_messages
      FOR INSERT
      WITH CHECK (customer_email = auth.jwt() ->> ''email'')';

    -- Users can update their own messages (mark as read)
    EXECUTE 'CREATE POLICY "Users can update own messages" ON conversation_messages
      FOR UPDATE
      USING (customer_email = auth.jwt() ->> ''email'')';

    -- Admin can view all messages
    EXECUTE 'CREATE POLICY "Admin can view all messages" ON conversation_messages
      FOR SELECT
      USING (auth.jwt() ->> ''email'' = ''muindidamian@gmail.com'')';

    -- Admin can insert messages in any conversation
    EXECUTE 'CREATE POLICY "Admin can insert messages" ON conversation_messages
      FOR INSERT
      WITH CHECK (auth.jwt() ->> ''email'' = ''muindidamian@gmail.com'')';

    -- Admin can update any message
    EXECUTE 'CREATE POLICY "Admin can update all messages" ON conversation_messages
      FOR UPDATE
      USING (auth.jwt() ->> ''email'' = ''muindidamian@gmail.com'')';
  END IF;
END $$;

-- ============================================================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT SELECT ON orders TO authenticated;
GRANT INSERT ON orders TO authenticated;
GRANT UPDATE ON orders TO authenticated;

GRANT SELECT ON order_items TO authenticated;
GRANT INSERT ON order_items TO authenticated;

GRANT SELECT ON products TO authenticated, anon;

GRANT SELECT ON reviews TO authenticated, anon;
GRANT INSERT ON reviews TO authenticated;
GRANT UPDATE ON reviews TO authenticated;
GRANT DELETE ON reviews TO authenticated;

GRANT SELECT ON custom_orders TO authenticated;
GRANT INSERT ON custom_orders TO authenticated;
GRANT UPDATE ON custom_orders TO authenticated;

GRANT SELECT ON profiles TO authenticated;
GRANT INSERT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$ 
BEGIN
  RAISE NOTICE 'RLS policies have been successfully updated!';
  RAISE NOTICE 'Admin email: muindidamian@gmail.com';
  RAISE NOTICE 'All policies now use auth.jwt() instead of auth.users queries.';
END $$;
