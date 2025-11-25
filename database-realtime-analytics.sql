-- Sweet Tooth Pastries - Real-time Analytics Enhancement
-- Run this in your Supabase SQL Editor to enable full real-time capabilities

-- =====================================================
-- 1. Ensure Real-time is enabled for all core tables
-- =====================================================

-- Enable realtime for orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
END $$;

-- Enable realtime for order_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'order_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
  END IF;
END $$;

-- Enable realtime for products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;
END $$;

-- Enable realtime for reviews table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'reviews'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
  END IF;
END $$;

-- Enable realtime for custom_orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'custom_orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE custom_orders;
  END IF;
END $$;

-- =====================================================
-- 2. Add analytics-optimized indexes
-- =====================================================

-- Orders table indexes for fast analytics queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_status_payment ON orders(status, payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_status ON orders(created_at DESC, status);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_name ON order_items(product_name);

-- Custom orders indexes
CREATE INDEX IF NOT EXISTS idx_custom_orders_created_at ON custom_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON custom_orders(status);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_on_offer ON products(on_offer);

-- =====================================================
-- 3. Add updated_at triggers for real-time tracking
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at column to orders if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at to custom_orders if needed
ALTER TABLE custom_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for custom_orders
DROP TRIGGER IF EXISTS update_custom_orders_updated_at ON custom_orders;
CREATE TRIGGER update_custom_orders_updated_at 
    BEFORE UPDATE ON custom_orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at to products if needed
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. Create materialized view for fast analytics
-- =====================================================

-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS daily_sales_summary;

-- Create materialized view for daily analytics
CREATE MATERIALIZED VIEW daily_sales_summary AS
SELECT 
    DATE(created_at) as order_date,
    COUNT(*) as total_orders,
    COUNT(DISTINCT customer_phone) as unique_customers,
    SUM(CASE WHEN payment_status = 'PAID' THEN total_amount ELSE 0 END) as total_revenue,
    SUM(CASE WHEN payment_status = 'PAID' THEN 1 ELSE 0 END) as paid_orders,
    SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered_orders,
    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_orders,
    SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_orders,
    AVG(CASE WHEN payment_status = 'PAID' THEN total_amount ELSE NULL END) as avg_order_value
FROM orders
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales_summary(order_date);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_daily_sales_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales_summary;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a trigger to auto-refresh the materialized view
-- Note: This might be expensive on high-traffic sites, use with caution
CREATE OR REPLACE FUNCTION trigger_refresh_daily_sales()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_daily_sales_summary();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Uncomment the following if you want automatic refresh (can be resource-intensive)
-- DROP TRIGGER IF EXISTS refresh_sales_on_order_change ON orders;
-- CREATE TRIGGER refresh_sales_on_order_change
--     AFTER INSERT OR UPDATE OR DELETE ON orders
--     FOR EACH STATEMENT
--     EXECUTE FUNCTION trigger_refresh_daily_sales();

-- =====================================================
-- 5. Enhanced RLS Policies for Admin Access
-- =====================================================

-- Ensure admin has full access to orders
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;
CREATE POLICY "Admin full access to orders" ON orders
  FOR ALL 
  USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- Allow users to view their own orders
DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders
  FOR SELECT 
  USING (customer_email = auth.jwt() ->> 'email');

-- Allow authenticated users to create orders
DROP POLICY IF EXISTS "Users create orders" ON orders;
CREATE POLICY "Users create orders" ON orders
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Order items policies
DROP POLICY IF EXISTS "Admin full access to order_items" ON order_items;
CREATE POLICY "Admin full access to order_items" ON order_items
  FOR ALL 
  USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

DROP POLICY IF EXISTS "Users view own order_items" ON order_items;
CREATE POLICY "Users view own order_items" ON order_items
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.customer_email = auth.jwt() ->> 'email'
  ));

-- Custom orders policies
DROP POLICY IF EXISTS "Admin full access to custom_orders" ON custom_orders;
CREATE POLICY "Admin full access to custom_orders" ON custom_orders
  FOR ALL 
  USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

DROP POLICY IF EXISTS "Users create custom_orders" ON custom_orders;
CREATE POLICY "Users create custom_orders" ON custom_orders
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Products policies (read-only for users, full access for admin)
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Admin full access to products" ON products;
CREATE POLICY "Admin full access to products" ON products
  FOR ALL 
  USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- Reviews policies
DROP POLICY IF EXISTS "Public read approved reviews" ON reviews;
CREATE POLICY "Public read approved reviews" ON reviews
  FOR SELECT 
  USING (approved = true OR auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

DROP POLICY IF EXISTS "Users create reviews" ON reviews;
CREATE POLICY "Users create reviews" ON reviews
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access to reviews" ON reviews;
CREATE POLICY "Admin full access to reviews" ON reviews
  FOR ALL 
  USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- =====================================================
-- 6. Analytics Helper Functions
-- =====================================================

-- Function to get today's statistics
CREATE OR REPLACE FUNCTION get_today_stats()
RETURNS TABLE (
  today_orders BIGINT,
  today_revenue NUMERIC,
  pending_orders BIGINT,
  paid_orders BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as today_orders,
    COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN total_amount ELSE 0 END), 0) as today_revenue,
    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_orders,
    SUM(CASE WHEN payment_status = 'PAID' THEN 1 ELSE 0 END) as paid_orders
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to get period statistics
CREATE OR REPLACE FUNCTION get_period_stats(days_ago INTEGER)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue NUMERIC,
  unique_customers BIGINT,
  avg_order_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_orders,
    COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN total_amount ELSE 0 END), 0) as total_revenue,
    COUNT(DISTINCT customer_phone) as unique_customers,
    COALESCE(AVG(CASE WHEN payment_status = 'PAID' THEN total_amount ELSE NULL END), 0) as avg_order_value
  FROM orders
  WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_ago;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. Notifications and Logging
-- =====================================================

-- Add admin_notifications table for tracking important events
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('new_order', 'payment_received', 'low_stock', 'new_review', 'custom_order')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);

-- Enable realtime for admin notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'admin_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;
  END IF;
END $$;

-- =====================================================
-- Done! Real-time analytics is now fully configured.
-- 
-- To manually refresh the materialized view, run:
-- SELECT refresh_daily_sales_summary();
-- 
-- Consider setting up a cron job to refresh it periodically:
-- https://supabase.com/docs/guides/database/extensions/pg_cron
-- =====================================================

