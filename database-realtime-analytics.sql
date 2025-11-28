-- Sweet Tooth Bakery - Database Migration v3.0
-- Production-ready database with real-time capabilities, RLS policies, and analytics

-- Clean up: Remove products with price below 500
DELETE FROM products WHERE price < 500;

-- ============================================================================
-- INTELLIGENT IMAGE MAPPING: Match database products to local asset files
-- ============================================================================
-- This section updates product image_url to point to local /src/assets/ images
-- Uses intelligent keyword matching since product names may differ from filenames

-- CAKES: Tiered Cakes
UPDATE products SET image_url = '/src/assets/2 tier cake.jpeg'
WHERE (LOWER(name) LIKE '%2 tier%' OR LOWER(name) LIKE '%two tier%') 
AND category = 'cakes';

UPDATE products SET image_url = '/src/assets/3 tier cake.jpeg'
WHERE (LOWER(name) LIKE '%3 tier%' OR LOWER(name) LIKE '%three tier%') 
AND category = 'cakes';

UPDATE products SET image_url = '/src/assets/4 tier cake.jpeg'
WHERE (LOWER(name) LIKE '%4 tier%' OR LOWER(name) LIKE '%four tier%') 
AND category = 'cakes';

-- CAKES: Special Shapes
UPDATE products SET image_url = '/src/assets/heart cake.jpeg'
WHERE LOWER(name) LIKE '%heart%' AND category = 'cakes';

UPDATE products SET image_url = '/src/assets/letter cake.jpeg'
WHERE LOWER(name) LIKE '%letter%' AND category = 'cakes';

UPDATE products SET image_url = '/src/assets/number cake.jpeg'
WHERE (LOWER(name) LIKE '%number%' OR LOWER(name) LIKE '%digit%') 
AND category = 'cakes';

UPDATE products SET image_url = '/src/assets/round cake.jpeg'
WHERE LOWER(name) LIKE '%round%' AND category = 'cakes';

UPDATE products SET image_url = '/src/assets/square cake.jpeg'
WHERE LOWER(name) LIKE '%square%' AND category = 'cakes';

UPDATE products SET image_url = '/src/assets/sheet cake.jpeg'
WHERE LOWER(name) LIKE '%sheet%' AND category = 'cakes';

UPDATE products SET image_url = '/src/assets/pound cake.jpeg'
WHERE LOWER(name) LIKE '%pound%' AND category = 'cakes';

-- CAKES: Special Occasions
UPDATE products SET image_url = '/src/assets/birthday-cakes.jpg'
WHERE LOWER(name) LIKE '%birthday%' AND category = 'cakes';

UPDATE products SET image_url = '/src/assets/fruit-cakes.jpg'
WHERE LOWER(name) LIKE '%fruit%' AND category = 'cakes';

-- CUPCAKES: Box Sizes (check 24 BEFORE 12 to avoid false matches)
UPDATE products SET image_url = '/src/assets/cupcakes box of 24.jpeg'
WHERE (LOWER(name) LIKE '%24%' OR LOWER(name) LIKE '%2 dozen%' OR LOWER(name) LIKE '%box of 24%') 
AND category = 'cupcakes';

UPDATE products SET image_url = '/src/assets/cupcakes box of 12.jpeg'
WHERE (LOWER(name) LIKE '%12%' OR LOWER(name) LIKE '%dozen%' OR LOWER(name) LIKE '%box of 12%') 
AND category = 'cupcakes' AND image_url IS NULL;

UPDATE products SET image_url = '/src/assets/cupcakes box of 6.jpeg'
WHERE (LOWER(name) LIKE '%6%' OR LOWER(name) LIKE '%box of 6%' OR LOWER(name) LIKE '%half dozen%') 
AND category = 'cupcakes' AND image_url IS NULL;

UPDATE products SET image_url = '/src/assets/mini cupcakes.jpeg'
WHERE LOWER(name) LIKE '%mini%' AND category = 'cupcakes';

-- CUPCAKES: Default for remaining cupcakes
UPDATE products SET image_url = '/src/assets/cupcakes.jpg'
WHERE category = 'cupcakes' AND image_url IS NULL;

-- COOKIES: Box Sizes and Types
UPDATE products SET image_url = '/src/assets/cookie box of 24.jpeg'
WHERE (LOWER(name) LIKE '%24%' OR LOWER(name) LIKE '%2 dozen%' OR LOWER(name) LIKE '%box of 24%') 
AND category = 'cookies';

UPDATE products SET image_url = '/src/assets/cookie box of 12.jpeg'
WHERE (LOWER(name) LIKE '%12%' OR LOWER(name) LIKE '%dozen%' OR LOWER(name) LIKE '%box of 12%') 
AND category = 'cookies';

UPDATE products SET image_url = '/src/assets/cookie box .jpeg'
WHERE LOWER(name) LIKE '%box%' AND category = 'cookies' AND image_url IS NULL;

UPDATE products SET image_url = '/src/assets/Giant Cookie.jpeg'
WHERE (LOWER(name) LIKE '%giant%' OR LOWER(name) LIKE '%large%' OR LOWER(name) LIKE '%jumbo%') 
AND category = 'cookies';

-- COOKIES: Default for remaining cookies
UPDATE products SET image_url = '/src/assets/cookies.jpg'
WHERE category = 'cookies' AND image_url IS NULL;

-- BROWNIES: Box Sizes
UPDATE products SET image_url = '/src/assets/browies box of 6.jpeg'
WHERE (LOWER(name) LIKE '%6%' OR LOWER(name) LIKE '%box of 6%' OR LOWER(name) LIKE '%half dozen%') 
AND category = 'brownies';

-- BROWNIES: Default for remaining brownies
UPDATE products SET image_url = '/src/assets/brownies.jpg'
WHERE category = 'brownies' AND image_url IS NULL;

-- MUFFINS
UPDATE products SET image_url = '/src/assets/muffins.jpg'
WHERE category = 'muffins' OR LOWER(name) LIKE '%muffin%';

-- BREAD & LOAVES
UPDATE products SET image_url = '/src/assets/banana-bread.jpg'
WHERE LOWER(name) LIKE '%banana%' AND (LOWER(name) LIKE '%bread%' OR LOWER(name) LIKE '%loaf%');

UPDATE products SET image_url = '/src/assets/loafs.jpg'
WHERE (LOWER(name) LIKE '%bread%' OR LOWER(name) LIKE '%loaf%') AND image_url IS NULL;

-- CAKE POPS
UPDATE products SET image_url = '/src/assets/cake pops.jpeg'
WHERE LOWER(name) LIKE '%cake pop%';

-- CINNAMON ROLLS
UPDATE products SET image_url = '/src/assets/cinnamon-rolls.jpg'
WHERE LOWER(name) LIKE '%cinnamon%';

-- DEFAULT FALLBACK: Any remaining cakes without images
UPDATE products SET image_url = '/src/assets/delicious-cake-1.jpeg'
WHERE category = 'cakes' AND image_url IS NULL;

-- DEFAULT FALLBACK: Any remaining products without images get a generic cake image
UPDATE products SET image_url = '/src/assets/delicious-cake-2.jpeg'
WHERE image_url IS NULL;

-- Drop and recreate publication for clean setup
DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;

-- Create publication with all application tables
CREATE PUBLICATION supabase_realtime FOR TABLE
  orders,
  order_items,
  products,
  reviews,
  custom_orders,
  profiles,
  admin_notifications,
  conversations,
  conversation_messages;

-- Performance Indexes
-- Orders table
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Custom orders indexes
CREATE INDEX IF NOT EXISTS idx_custom_orders_user_id ON custom_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON custom_orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_created_at ON custom_orders(created_at DESC);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Materialized Views & Analytics
DROP MATERIALIZED VIEW IF EXISTS daily_sales_summary CASCADE;

-- Create materialized view for daily sales analytics
CREATE MATERIALIZED VIEW daily_sales_summary AS
SELECT
  DATE(created_at) as sale_date,
  COUNT(*) as order_count,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value,
  COUNT(DISTINCT customer_email) as unique_customers
FROM orders
WHERE status != 'CANCELLED'
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales_summary(sale_date DESC);

-- Function to refresh materialized view
DROP FUNCTION IF EXISTS refresh_daily_sales();
CREATE OR REPLACE FUNCTION refresh_daily_sales()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers & Functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at on orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers for updated_at on custom_orders
DROP TRIGGER IF EXISTS update_custom_orders_updated_at ON custom_orders;
CREATE TRIGGER update_custom_orders_updated_at
  BEFORE UPDATE ON custom_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers for updated_at on products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Orders Policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;

-- Users can view their own orders by email (using auth.email() instead of profiles lookup)
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (
    customer_email = auth.jwt() ->> 'email'
  );

-- Users can insert their own orders
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT
  WITH CHECK (
    customer_email = auth.jwt() ->> 'email'
  );

-- Users can update their own orders (for status changes)
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE
  USING (
    customer_email = auth.jwt() ->> 'email'
  );

-- Admins have full access to all orders (using auth.users instead of profiles)
CREATE POLICY "Admin full access to orders" ON orders
  FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- Order Items Policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Admin full access to order items" ON order_items;

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

-- Admins have full access to all order items (using auth.users)
CREATE POLICY "Admin full access to order items" ON order_items
  FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- Products Policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;

-- Anyone can view products (public access)
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT
  USING (true);

-- Only admins can manage products (using auth.users)
CREATE POLICY "Admin can manage products" ON products
  FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- Reviews Policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Admin full access to reviews" ON reviews;

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

-- Admins have full access to all reviews (using auth.users)
CREATE POLICY "Admin full access to reviews" ON reviews
  FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- Custom Orders Policies
DROP POLICY IF EXISTS "Users can view own custom orders" ON custom_orders;
DROP POLICY IF EXISTS "Users can insert custom orders" ON custom_orders;
DROP POLICY IF EXISTS "Users can update own custom orders" ON custom_orders;
DROP POLICY IF EXISTS "Admin full access to custom orders" ON custom_orders;

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

-- Admins have full access to all custom orders (using auth.users)
CREATE POLICY "Admin full access to custom orders" ON custom_orders
  FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;

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

-- Admin can delete profiles (using auth.users to avoid recursion)
CREATE POLICY "Admin can delete profiles" ON profiles
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- Helper Functions
DROP FUNCTION IF EXISTS get_today_stats();
CREATE OR REPLACE FUNCTION get_today_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders', COUNT(*),
    'total_revenue', COALESCE(SUM(total_amount), 0),
    'avg_order_value', COALESCE(AVG(total_amount), 0),
    'pending_orders', COUNT(*) FILTER (WHERE status = 'PENDING'),
    'completed_orders', COUNT(*) FILTER (WHERE status = 'COMPLETED')
  )
  INTO result
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE
  AND status != 'CANCELLED';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get statistics for a specific period
DROP FUNCTION IF EXISTS get_period_stats(INTEGER);
CREATE OR REPLACE FUNCTION get_period_stats(days_ago INTEGER DEFAULT 7)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders', COUNT(*),
    'total_revenue', COALESCE(SUM(total_amount), 0),
    'avg_order_value', COALESCE(AVG(total_amount), 0),
    'unique_customers', COUNT(DISTINCT customer_email),
    'pending_orders', COUNT(*) FILTER (WHERE status = 'PENDING'),
    'processing_orders', COUNT(*) FILTER (WHERE status = 'PROCESSING'),
    'completed_orders', COUNT(*) FILTER (WHERE status = 'COMPLETED'),
    'cancelled_orders', COUNT(*) FILTER (WHERE status = 'CANCELLED')
  )
  INTO result
  FROM orders
  WHERE created_at >= CURRENT_DATE - days_ago
  AND status != 'CANCELLED';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product performance
DROP FUNCTION IF EXISTS get_product_performance(INTEGER);
CREATE OR REPLACE FUNCTION get_product_performance(days_ago INTEGER DEFAULT 30)
RETURNS TABLE(
  product_id UUID,
  product_name TEXT,
  total_quantity INTEGER,
  total_revenue NUMERIC,
  order_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    oi.product_id,
    p.title as product_name,
    SUM(oi.quantity)::INTEGER as total_quantity,
    SUM(oi.price * oi.quantity) as total_revenue,
    COUNT(DISTINCT oi.order_id)::INTEGER as order_count
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN orders o ON o.id = oi.order_id
  WHERE o.created_at >= CURRENT_DATE - days_ago
  AND o.status != 'CANCELLED'
  GROUP BY oi.product_id, p.title
  ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin Notifications Table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  reference_id UUID,
  reference_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for admin notifications
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);

-- Enable RLS on admin notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admin notifications policies
DROP POLICY IF EXISTS "Admin can view notifications" ON admin_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Admin can update notifications" ON admin_notifications;

-- Only admins can view notifications (using auth.users)
CREATE POLICY "Admin can view notifications" ON admin_notifications
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- System can insert notifications (service role)
CREATE POLICY "System can insert notifications" ON admin_notifications
  FOR INSERT
  WITH CHECK (true);

-- Admins can update notifications (using auth.users)
CREATE POLICY "Admin can update notifications" ON admin_notifications
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- Customer Messaging Tables
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unread_admin_count INTEGER DEFAULT 0,
  unread_customer_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  customer_email VARCHAR(255) NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_customer_email ON conversations(customer_email);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

-- Indexes for conversation messages
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_read ON conversation_messages(read);

-- Enable RLS on conversations and messages
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Conversations RLS Policies
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Admin can view all conversations" ON conversations;
DROP POLICY IF EXISTS "Admin can update all conversations" ON conversations;

-- Users can view their own conversations by email (using auth.users)
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT
  USING (
    customer_email = auth.jwt() ->> 'email'
  );

-- Users can insert their own conversations (using auth.users)
CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT
  WITH CHECK (
    customer_email = auth.jwt() ->> 'email'
  );

-- Users can update their own conversations (using auth.users)
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE
  USING (
    customer_email = auth.jwt() ->> 'email'
  );

-- Admin can view all conversations (using auth.users)
CREATE POLICY "Admin can view all conversations" ON conversations
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- Admin can update all conversations (using auth.users)
CREATE POLICY "Admin can update all conversations" ON conversations
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- Conversation Messages RLS Policies
DROP POLICY IF EXISTS "Users can view own messages" ON conversation_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON conversation_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON conversation_messages;
DROP POLICY IF EXISTS "Admin can view all messages" ON conversation_messages;
DROP POLICY IF EXISTS "Admin can insert messages" ON conversation_messages;
DROP POLICY IF EXISTS "Admin can update all messages" ON conversation_messages;

-- Users can view messages in their own conversations (using auth.users)
CREATE POLICY "Users can view own messages" ON conversation_messages
  FOR SELECT
  USING (
    customer_email = auth.jwt() ->> 'email'
  );

-- Users can insert messages in their own conversations (using auth.users)
CREATE POLICY "Users can insert own messages" ON conversation_messages
  FOR INSERT
  WITH CHECK (
    customer_email = auth.jwt() ->> 'email'
  );

-- Users can update their own messages (using auth.users - mark as read)
CREATE POLICY "Users can update own messages" ON conversation_messages
  FOR UPDATE
  USING (
    customer_email = auth.jwt() ->> 'email'
  );

-- Admin can view all messages (using auth.users)
CREATE POLICY "Admin can view all messages" ON conversation_messages
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- Admin can insert messages in any conversation (using auth.users)
CREATE POLICY "Admin can insert messages" ON conversation_messages
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- Admin can update any message (using auth.users)
CREATE POLICY "Admin can update all messages" ON conversation_messages
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- Triggers for Admin Notifications
DROP FUNCTION IF EXISTS notify_new_order() CASCADE;
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_notifications (type, title, message, reference_id, reference_type)
  VALUES (
    'new_order',
    'New Order Received',
    'Order #' || NEW.id || ' - Ksh ' || NEW.total_amount,
    NEW.id,
    'order'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new orders
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Function to create notification on new custom order
DROP FUNCTION IF EXISTS notify_new_custom_order() CASCADE;
CREATE OR REPLACE FUNCTION notify_new_custom_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_notifications (type, title, message, reference_id, reference_type)
  VALUES (
    'new_custom_order',
    'New Custom Order',
    'Custom order request from customer',
    NEW.id,
    'custom_order'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new custom orders
DROP TRIGGER IF EXISTS trigger_notify_new_custom_order ON custom_orders;
CREATE TRIGGER trigger_notify_new_custom_order
  AFTER INSERT ON custom_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_custom_order();

-- ============================================================================
-- ADMIN DASHBOARD COMPREHENSIVE TABLES (PRD v1.0)
-- ============================================================================

-- ============================================================================
-- 1. STAFF & ROLE MANAGEMENT
-- ============================================================================

-- Admin Roles Table
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default roles
INSERT INTO admin_roles (name, description, permissions) VALUES
  ('owner', 'Full access to all features', '{"all": true}'),
  ('manager', 'Manage orders, products, customers, inventory', '{"orders": true, "products": true, "customers": true, "inventory": true, "analytics": true, "reviews": true}'),
  ('kitchen_staff', 'View and update order status', '{"orders": {"view": true, "update_status": true}}'),
  ('customer_support', 'Handle customer inquiries and orders', '{"orders": {"view": true}, "customers": true, "messaging": true, "reviews": true}')
ON CONFLICT (name) DO NOTHING;

-- Staff Members Table
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role_id UUID REFERENCES admin_roles(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Activity Logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  admin_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for staff tables
CREATE INDEX IF NOT EXISTS idx_staff_members_email ON staff_members(email);
CREATE INDEX IF NOT EXISTS idx_staff_members_role ON staff_members(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_status ON staff_members(status);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_staff ON admin_activity_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(action);

-- ============================================================================
-- 2. INVENTORY MANAGEMENT
-- ============================================================================

-- Inventory Items (Ingredients/Supplies)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  category VARCHAR(100),
  quantity DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  reorder_level DECIMAL(10,2) DEFAULT 0,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  supplier_id UUID,
  expiry_date DATE,
  location VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Transactions Log
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('restock', 'usage', 'adjustment', 'waste', 'return')),
  quantity_change DECIMAL(10,2) NOT NULL,
  quantity_before DECIMAL(10,2) NOT NULL,
  quantity_after DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2),
  reason TEXT,
  reference_type VARCHAR(50),
  reference_id UUID,
  staff_id UUID REFERENCES staff_members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  payment_terms VARCHAR(100),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to inventory_items
ALTER TABLE inventory_items 
  ADD CONSTRAINT fk_inventory_supplier 
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

-- Indexes for inventory
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_quantity ON inventory_items(quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_items_reorder ON inventory_items(quantity, reorder_level) WHERE quantity <= reorder_level;
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created ON inventory_transactions(created_at DESC);

-- ============================================================================
-- 3. CUSTOMER MANAGEMENT
-- ============================================================================

-- Customer Segments/Tags
CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1',
  criteria JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default segments
INSERT INTO customer_segments (name, description, color) VALUES
  ('VIP', 'High-value customers with 10+ orders or Ksh 50,000+ lifetime value', '#f59e0b'),
  ('Regular', 'Returning customers with 3-9 orders', '#10b981'),
  ('New', 'First-time customers', '#3b82f6'),
  ('At Risk', 'Customers who haven''t ordered in 60+ days', '#ef4444'),
  ('Birthday This Month', 'Customers with birthdays this month', '#ec4899')
ON CONFLICT (name) DO NOTHING;

-- Customer Profiles Extended (extends auth.users)
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  date_of_birth DATE,
  default_address JSONB,
  addresses JSONB DEFAULT '[]',
  preferences JSONB DEFAULT '{}',
  loyalty_points INTEGER DEFAULT 0,
  lifetime_value DECIMAL(12,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  first_order_date TIMESTAMP WITH TIME ZONE,
  last_order_date TIMESTAMP WITH TIME ZONE,
  is_email_verified BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Segment Assignments
CREATE TABLE IF NOT EXISTS customer_segment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, segment_id)
);

-- Customer Notes (Internal staff notes)
CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id),
  note TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for customer tables
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_loyalty ON customer_profiles(loyalty_points DESC);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_lifetime_value ON customer_profiles(lifetime_value DESC);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_last_order ON customer_profiles(last_order_date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_segment_assignments_customer ON customer_segment_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer ON customer_notes(customer_id);

-- ============================================================================
-- 4. PROMOTIONS & DISCOUNT CODES
-- ============================================================================

-- Discount Codes
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping', 'free_item')),
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  maximum_discount_amount DECIMAL(10,2),
  applies_to VARCHAR(20) DEFAULT 'all' CHECK (applies_to IN ('all', 'specific_products', 'specific_categories')),
  applicable_items JSONB DEFAULT '[]',
  usage_limit INTEGER,
  usage_per_customer INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  requires_login BOOLEAN DEFAULT false,
  first_order_only BOOLEAN DEFAULT false,
  created_by UUID REFERENCES staff_members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount Usage Tracking
CREATE TABLE IF NOT EXISTS discount_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_email VARCHAR(255) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for discounts
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_discount_usage_discount ON discount_usage(discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_customer ON discount_usage(customer_email);

-- ============================================================================
-- 5. GIFT CARDS
-- ============================================================================

-- Gift Cards
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  initial_amount DECIMAL(10,2) NOT NULL,
  current_balance DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  purchaser_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  purchaser_email VARCHAR(255),
  purchaser_name VARCHAR(255),
  recipient_email VARCHAR(255),
  recipient_name VARCHAR(255),
  personal_message TEXT,
  delivery_method VARCHAR(20) DEFAULT 'email' CHECK (delivery_method IN ('email', 'physical', 'print')),
  delivery_date DATE,
  is_delivered BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Card Transactions
CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'redemption', 'refund', 'adjustment', 'expiry')),
  amount DECIMAL(10,2) NOT NULL,
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for gift cards
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_recipient ON gift_cards(recipient_email);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_card ON gift_card_transactions(gift_card_id);

-- ============================================================================
-- 6. DELIVERY MANAGEMENT
-- ============================================================================

-- Delivery Zones
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  polygon JSONB,
  postal_codes TEXT[],
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  minimum_order DECIMAL(10,2) DEFAULT 0,
  estimated_time_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery Time Slots
CREATE TABLE IF NOT EXISTS delivery_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery Blackout Dates
CREATE TABLE IF NOT EXISTS delivery_blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blackout_date DATE NOT NULL,
  reason VARCHAR(255),
  zone_id UUID REFERENCES delivery_zones(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery Drivers (if using in-house delivery)
CREATE TABLE IF NOT EXISTS delivery_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  vehicle_type VARCHAR(50),
  vehicle_number VARCHAR(50),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Deliveries
CREATE TABLE IF NOT EXISTS order_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES delivery_drivers(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES delivery_zones(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time_slot VARCHAR(50),
  delivery_address JSONB NOT NULL,
  delivery_instructions TEXT,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned')),
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  proof_of_delivery TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for delivery tables
CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON delivery_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_time_slots_day ON delivery_time_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_delivery_blackout_dates_date ON delivery_blackout_dates(blackout_date);
CREATE INDEX IF NOT EXISTS idx_order_deliveries_order ON order_deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_order_deliveries_driver ON order_deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_order_deliveries_date ON order_deliveries(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_order_deliveries_status ON order_deliveries(status);

-- ============================================================================
-- 7. CONTENT MANAGEMENT
-- ============================================================================

-- Gallery Images
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  caption TEXT,
  image_url TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES staff_members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hero Slider Items
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_text VARCHAR(100),
  text_position VARCHAR(20) DEFAULT 'center' CHECK (text_position IN ('left', 'center', 'right')),
  sort_order INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements/Banners
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'promo')),
  link_url TEXT,
  link_text VARCHAR(100),
  background_color VARCHAR(7),
  text_color VARCHAR(7),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_dismissible BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Items
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for content tables
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_images_featured ON gallery_images(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON hero_slides(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_faq_items_category ON faq_items(category, sort_order);

-- ============================================================================
-- 8. ORDER ENHANCEMENTS
-- ============================================================================

-- Order Status History
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES staff_members(id),
  changed_by_email VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Internal Notes
CREATE TABLE IF NOT EXISTS order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id),
  note TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Refunds
CREATE TABLE IF NOT EXISTS order_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  refund_type VARCHAR(20) NOT NULL CHECK (refund_type IN ('full', 'partial')),
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  refund_method VARCHAR(50),
  transaction_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_by UUID REFERENCES staff_members(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for order enhancements
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created ON order_status_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_notes_order ON order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_refunds_order ON order_refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_order_refunds_status ON order_refunds(status);

-- ============================================================================
-- 9. PRODUCT ENHANCEMENTS
-- ============================================================================

-- Product Categories (Enhanced)
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Nutritional Info
CREATE TABLE IF NOT EXISTS product_nutritional_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  serving_size VARCHAR(50),
  calories INTEGER,
  total_fat DECIMAL(5,2),
  saturated_fat DECIMAL(5,2),
  cholesterol DECIMAL(5,2),
  sodium DECIMAL(5,2),
  total_carbs DECIMAL(5,2),
  dietary_fiber DECIMAL(5,2),
  sugars DECIMAL(5,2),
  protein DECIMAL(5,2),
  ingredients TEXT,
  allergens TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for product enhancements
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- ============================================================================
-- 10. CUSTOM ORDER ENHANCEMENTS
-- ============================================================================

-- Custom Order Quotes
CREATE TABLE IF NOT EXISTS custom_order_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_order_id UUID NOT NULL REFERENCES custom_orders(id) ON DELETE CASCADE,
  quote_number VARCHAR(50) UNIQUE,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  line_items JSONB NOT NULL DEFAULT '[]',
  terms TEXT,
  valid_until DATE,
  deposit_required DECIMAL(10,2) DEFAULT 0,
  deposit_paid DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  sent_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES staff_members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Order Communication Thread
CREATE TABLE IF NOT EXISTS custom_order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_order_id UUID NOT NULL REFERENCES custom_orders(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  sender_id UUID,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for custom order enhancements
CREATE INDEX IF NOT EXISTS idx_custom_order_quotes_order ON custom_order_quotes(custom_order_id);
CREATE INDEX IF NOT EXISTS idx_custom_order_quotes_status ON custom_order_quotes(status);
CREATE INDEX IF NOT EXISTS idx_custom_order_messages_order ON custom_order_messages(custom_order_id);

-- ============================================================================
-- 11. WISHLIST
-- ============================================================================

-- Customer Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

-- Indexes for wishlist
CREATE INDEX IF NOT EXISTS idx_wishlists_customer ON wishlists(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON wishlists(product_id);

-- ============================================================================
-- 12. ANALYTICS ENHANCEMENTS
-- ============================================================================

-- Page Views (Visitor Analytics)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100),
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  referrer TEXT,
  user_agent TEXT,
  ip_address VARCHAR(45),
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(50),
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Analytics Aggregation
CREATE TABLE IF NOT EXISTS daily_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_visitors INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  returning_customers INTEGER DEFAULT 0,
  cart_abandonment_rate DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  top_products JSONB DEFAULT '[]',
  top_categories JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date DESC);

-- ============================================================================
-- 13. STORE SETTINGS
-- ============================================================================

-- Store Configuration
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50),
  updated_by UUID REFERENCES staff_members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default store settings
INSERT INTO store_settings (key, value, description, category) VALUES
  ('store_name', '"Sweet Tooth Bakery"', 'Business name', 'general'),
  ('store_email', '"info@sweettooth.com"', 'Contact email', 'general'),
  ('store_phone', '"+254712345678"', 'Contact phone', 'general'),
  ('store_address', '{"street": "123 Baker Street", "city": "Nairobi", "country": "Kenya"}', 'Physical address', 'general'),
  ('business_hours', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "16:00"}, "sunday": {"closed": true}}', 'Operating hours', 'general'),
  ('currency', '"KES"', 'Default currency', 'payment'),
  ('tax_rate', '16', 'Default tax percentage', 'payment'),
  ('minimum_order', '500', 'Minimum order amount in KES', 'orders'),
  ('order_lead_time', '24', 'Hours required for order preparation', 'orders'),
  ('enable_delivery', 'true', 'Enable delivery option', 'delivery'),
  ('enable_pickup', 'true', 'Enable pickup option', 'delivery'),
  ('loyalty_points_rate', '10', 'Points earned per 100 KES spent', 'loyalty'),
  ('loyalty_redemption_rate', '1', 'KES value per loyalty point', 'loyalty')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 14. RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_blackout_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_nutritional_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_order_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (using auth.users email check)
CREATE POLICY "Admin full access" ON admin_roles FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON staff_members FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON admin_activity_logs FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON inventory_items FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON inventory_transactions FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON suppliers FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON customer_segments FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON customer_profiles FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Users view own profile" ON customer_profiles FOR SELECT USING (
  id = auth.uid()
);

CREATE POLICY "Users update own profile" ON customer_profiles FOR UPDATE USING (
  id = auth.uid()
);

CREATE POLICY "Admin full access" ON customer_segment_assignments FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON customer_notes FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON discount_codes FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON discount_usage FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON gift_cards FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Users view own gift cards" ON gift_cards FOR SELECT USING (
  recipient_email = auth.jwt() ->> 'email' OR
  purchaser_email = auth.jwt() ->> 'email'
);

CREATE POLICY "Admin full access" ON gift_card_transactions FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Public read delivery zones" ON delivery_zones FOR SELECT USING (true);

CREATE POLICY "Admin manage delivery zones" ON delivery_zones FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Public read time slots" ON delivery_time_slots FOR SELECT USING (true);

CREATE POLICY "Admin manage time slots" ON delivery_time_slots FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Public read blackout dates" ON delivery_blackout_dates FOR SELECT USING (true);

CREATE POLICY "Admin manage blackout dates" ON delivery_blackout_dates FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON delivery_drivers FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON order_deliveries FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Users view own deliveries" ON order_deliveries FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_deliveries.order_id
    AND orders.customer_email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Public read gallery" ON gallery_images FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage gallery" ON gallery_images FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Public read hero slides" ON hero_slides FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage hero slides" ON hero_slides FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage announcements" ON announcements FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Public read FAQ" ON faq_items FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage FAQ" ON faq_items FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON order_status_history FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Users view own order history" ON order_status_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id
    AND orders.customer_email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Admin full access" ON order_notes FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON order_refunds FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Users view own refunds" ON order_refunds FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_refunds.order_id
    AND orders.customer_email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Public read categories" ON product_categories FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage categories" ON product_categories FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Public read variants" ON product_variants FOR SELECT USING (true);

CREATE POLICY "Admin manage variants" ON product_variants FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Public read nutritional info" ON product_nutritional_info FOR SELECT USING (true);

CREATE POLICY "Admin manage nutritional info" ON product_nutritional_info FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON custom_order_quotes FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Users view own quotes" ON custom_order_quotes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM custom_orders WHERE custom_orders.id = custom_order_quotes.custom_order_id
    AND custom_orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admin full access" ON custom_order_messages FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Users access own messages" ON custom_order_messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM custom_orders WHERE custom_orders.id = custom_order_messages.custom_order_id
    AND custom_orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users manage own wishlist" ON wishlists FOR ALL USING (
  customer_id = auth.uid()
);

CREATE POLICY "Admin view wishlists" ON wishlists FOR SELECT USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Insert page views" ON page_views FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin view page views" ON page_views FOR SELECT USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Admin full access" ON daily_analytics FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

CREATE POLICY "Public read settings" ON store_settings FOR SELECT USING (true);

CREATE POLICY "Admin manage settings" ON store_settings FOR ALL USING (
  auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
);

-- ============================================================================
-- 15. HELPER FUNCTIONS FOR ADMIN DASHBOARD
-- ============================================================================

-- Function to get low stock inventory items
CREATE OR REPLACE FUNCTION get_low_stock_items()
RETURNS TABLE(
  id UUID,
  name VARCHAR(255),
  quantity DECIMAL(10,2),
  reorder_level DECIMAL(10,2),
  unit VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.name, i.quantity, i.reorder_level, i.unit
  FROM inventory_items i
  WHERE i.quantity <= i.reorder_level AND i.is_active = true
  ORDER BY (i.quantity / NULLIF(i.reorder_level, 0)) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get customer lifetime value
CREATE OR REPLACE FUNCTION calculate_customer_stats(customer_email_param VARCHAR)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders', COUNT(*),
    'total_spent', COALESCE(SUM(total_amount), 0),
    'average_order', COALESCE(AVG(total_amount), 0),
    'first_order', MIN(created_at),
    'last_order', MAX(created_at)
  )
  INTO result
  FROM orders
  WHERE customer_email = customer_email_param AND status != 'CANCELLED';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate discount code
CREATE OR REPLACE FUNCTION validate_discount_code(
  code_param VARCHAR,
  order_amount DECIMAL,
  customer_email_param VARCHAR
)
RETURNS JSON AS $$
DECLARE
  discount_record RECORD;
  customer_usage INTEGER;
  result JSON;
BEGIN
  SELECT * INTO discount_record
  FROM discount_codes
  WHERE code = UPPER(code_param) AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid discount code');
  END IF;
  
  IF discount_record.start_date > NOW() THEN
    RETURN json_build_object('valid', false, 'error', 'Discount not yet active');
  END IF;
  
  IF discount_record.end_date IS NOT NULL AND discount_record.end_date < NOW() THEN
    RETURN json_build_object('valid', false, 'error', 'Discount has expired');
  END IF;
  
  IF discount_record.usage_limit IS NOT NULL AND discount_record.used_count >= discount_record.usage_limit THEN
    RETURN json_build_object('valid', false, 'error', 'Discount usage limit reached');
  END IF;
  
  IF discount_record.minimum_order_amount > order_amount THEN
    RETURN json_build_object('valid', false, 'error', 'Minimum order amount not met: ' || discount_record.minimum_order_amount);
  END IF;
  
  SELECT COUNT(*) INTO customer_usage
  FROM discount_usage
  WHERE discount_id = discount_record.id AND customer_email = customer_email_param;
  
  IF customer_usage >= discount_record.usage_per_customer THEN
    RETURN json_build_object('valid', false, 'error', 'You have already used this discount');
  END IF;
  
  RETURN json_build_object(
    'valid', true,
    'discount_type', discount_record.discount_type,
    'discount_value', discount_record.discount_value,
    'maximum_discount', discount_record.maximum_discount_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply gift card
CREATE OR REPLACE FUNCTION apply_gift_card(
  code_param VARCHAR,
  amount_to_apply DECIMAL
)
RETURNS JSON AS $$
DECLARE
  gift_card_record RECORD;
  actual_amount DECIMAL;
  result JSON;
BEGIN
  SELECT * INTO gift_card_record
  FROM gift_cards
  WHERE code = UPPER(code_param) AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or inactive gift card');
  END IF;
  
  IF gift_card_record.expires_at IS NOT NULL AND gift_card_record.expires_at < NOW() THEN
    UPDATE gift_cards SET status = 'expired' WHERE id = gift_card_record.id;
    RETURN json_build_object('success', false, 'error', 'Gift card has expired');
  END IF;
  
  IF gift_card_record.current_balance <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Gift card has no remaining balance');
  END IF;
  
  actual_amount := LEAST(amount_to_apply, gift_card_record.current_balance);
  
  RETURN json_build_object(
    'success', true,
    'gift_card_id', gift_card_record.id,
    'available_balance', gift_card_record.current_balance,
    'amount_to_apply', actual_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log order status change
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, previous_status, new_status, changed_by_email)
    VALUES (NEW.id, OLD.status, NEW.status, auth.jwt() ->> 'email');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for order status history
DROP TRIGGER IF EXISTS trigger_log_order_status ON orders;
CREATE TRIGGER trigger_log_order_status
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Function to update customer stats after order
CREATE OR REPLACE FUNCTION update_customer_stats_after_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' THEN
    UPDATE customer_profiles
    SET 
      total_orders = total_orders + 1,
      lifetime_value = lifetime_value + NEW.total_amount,
      average_order_value = (lifetime_value + NEW.total_amount) / (total_orders + 1),
      last_order_date = NOW(),
      first_order_date = COALESCE(first_order_date, NOW()),
      updated_at = NOW()
    WHERE email = NEW.customer_email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for customer stats update
DROP TRIGGER IF EXISTS trigger_update_customer_stats ON orders;
CREATE TRIGGER trigger_update_customer_stats
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED')
  EXECUTE FUNCTION update_customer_stats_after_order();

-- ============================================================================
-- 16. ADD NEW TABLES TO REALTIME PUBLICATION
-- ============================================================================

-- Drop existing publication and recreate with all tables
DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;

CREATE PUBLICATION supabase_realtime FOR TABLE
  orders,
  order_items,
  order_status_history,
  order_notes,
  order_refunds,
  order_deliveries,
  products,
  product_variants,
  product_categories,
  reviews,
  custom_orders,
  custom_order_quotes,
  custom_order_messages,
  profiles,
  customer_profiles,
  admin_notifications,
  conversations,
  conversation_messages,
  inventory_items,
  inventory_transactions,
  discount_codes,
  gift_cards,
  gift_card_transactions,
  delivery_zones,
  delivery_drivers,
  gallery_images,
  hero_slides,
  announcements,
  staff_members,
  store_settings;
