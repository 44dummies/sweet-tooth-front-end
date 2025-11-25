-- =====================================================
-- SWEET TOOTH BAKERY - DATABASE MIGRATION
-- Real-time Analytics & Complete Schema Setup
-- =====================================================
-- Version: 3.0
-- Date: November 25, 2025
-- Description: Production-ready database with real-time capabilities,
--              optimized indexes, RLS policies, and analytics functions
-- =====================================================

-- =====================================================
-- TABLE OF CONTENTS
-- =====================================================
-- 1. Real-time Setup
-- 2. Performance Indexes
-- 3. Materialized Views & Analytics
-- 4. Triggers & Functions
-- 5. RLS Policies
-- 6. Helper Functions
-- =====================================================


-- =====================================================
-- SECTION 1: REAL-TIME SETUP
-- =====================================================

-- Clean up: Remove products with price below 500
DELETE FROM products WHERE price < 500;

-- Clear all existing image URLs to force use of Pexels images from frontend
UPDATE products SET image_url = NULL WHERE image_url IS NOT NULL;

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
  admin_notifications;

-- Note: Tables must exist before running this migration
-- Ensure all tables are created via Supabase dashboard or previous migrations


-- =====================================================
-- SECTION 2: PERFORMANCE INDEXES
-- =====================================================

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
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
-- Note: Role column removed - using email-based admin check instead


-- =====================================================
-- SECTION 3: MATERIALIZED VIEWS & ANALYTICS
-- =====================================================

-- Drop existing materialized view if exists
DROP MATERIALIZED VIEW IF EXISTS daily_sales_summary CASCADE;

-- Create materialized view for daily sales analytics
CREATE MATERIALIZED VIEW daily_sales_summary AS
SELECT
  DATE(created_at) as sale_date,
  COUNT(*) as order_count,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value,
  COUNT(DISTINCT user_id) as unique_customers
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


-- =====================================================
-- SECTION 4: TRIGGERS & FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
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


-- =====================================================
-- SECTION 5: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5.1: ORDERS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own orders
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders (for status changes)
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins have full access to all orders (check email without recursion)
CREATE POLICY "Admin full access to orders" ON orders
  FOR ALL
  USING (
    (SELECT email FROM profiles WHERE id = auth.uid()) = 'muindidamian@gmail.com'
  );

-- =====================================================
-- 5.2: ORDER ITEMS POLICIES
-- =====================================================

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
      AND orders.user_id = auth.uid()
    )
  );

-- Users can insert items to their own orders
CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins have full access to all order items (check email without recursion)
CREATE POLICY "Admin full access to order items" ON order_items
  FOR ALL
  USING (
    (SELECT email FROM profiles WHERE id = auth.uid()) = 'muindidamian@gmail.com'
  );

-- =====================================================
-- 5.3: PRODUCTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;

-- Anyone can view products (public access)
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT
  USING (true);

-- Only admins can manage products (check email without recursion)
CREATE POLICY "Admin can manage products" ON products
  FOR ALL
  USING (
    (SELECT email FROM profiles WHERE id = auth.uid()) = 'muindidamian@gmail.com'
  );

-- =====================================================
-- 5.4: REVIEWS POLICIES
-- =====================================================

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

-- Admins have full access to all reviews (check email without recursion)
CREATE POLICY "Admin full access to reviews" ON reviews
  FOR ALL
  USING (
    (SELECT email FROM profiles WHERE id = auth.uid()) = 'muindidamian@gmail.com'
  );

-- =====================================================
-- 5.5: CUSTOM ORDERS POLICIES
-- =====================================================

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

-- Admins have full access to all custom orders (check email without recursion)
CREATE POLICY "Admin full access to custom orders" ON custom_orders
  FOR ALL
  USING (
    (SELECT email FROM profiles WHERE id = auth.uid()) = 'muindidamian@gmail.com'
  );

-- =====================================================
-- 5.6: PROFILES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access to profiles" ON profiles;

-- All authenticated users can view all profiles (simplified to avoid recursion)
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

-- Admin can delete profiles (email check without recursion)
CREATE POLICY "Admin can delete profiles" ON profiles
  FOR DELETE
  USING (
    (SELECT email FROM profiles WHERE id = auth.uid()) = 'muindidamian@gmail.com'
  );


-- =====================================================
-- SECTION 6: HELPER FUNCTIONS
-- =====================================================

-- Function to get today's statistics
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
    'unique_customers', COUNT(DISTINCT user_id),
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


-- =====================================================
-- ADMIN NOTIFICATIONS TABLE
-- =====================================================

-- Create admin notifications table if not exists
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

-- Only admins can view notifications (check email without recursion)
CREATE POLICY "Admin can view notifications" ON admin_notifications
  FOR SELECT
  USING (
    (SELECT email FROM profiles WHERE id = auth.uid()) = 'muindidamian@gmail.com'
  );

-- System can insert notifications (service role)
CREATE POLICY "System can insert notifications" ON admin_notifications
  FOR INSERT
  WITH CHECK (true);

-- Admins can update notifications (check email without recursion)
CREATE POLICY "Admin can update notifications" ON admin_notifications
  FOR UPDATE
  USING (
    (SELECT email FROM profiles WHERE id = auth.uid()) = 'muindidamian@gmail.com'
  );


-- =====================================================
-- TRIGGERS FOR ADMIN NOTIFICATIONS
-- =====================================================

-- Function to create notification on new order
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


-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next Steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify all indexes are created
-- 3. Test RLS policies with different user roles
-- 4. Refresh materialized view: SELECT refresh_daily_sales();
-- 5. Test real-time subscriptions in application
-- =====================================================
