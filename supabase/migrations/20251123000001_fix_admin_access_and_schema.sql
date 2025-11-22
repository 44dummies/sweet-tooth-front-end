-- Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Ensure orders table has all required columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Ensure order_items has product_name column (in case old schema exists)
-- First check if we need to migrate from product_id to product_name
DO $$
BEGIN
  -- If product_name doesn't exist but product_id does, rename it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'product_name'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE order_items RENAME COLUMN product_id TO product_name;
    -- Change type to TEXT if it was UUID
    ALTER TABLE order_items ALTER COLUMN product_name TYPE TEXT;
  -- If neither exists, add product_name
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'product_name'
  ) THEN
    ALTER TABLE order_items ADD COLUMN product_name TEXT NOT NULL DEFAULT 'Unknown Product';
    -- Remove default after adding
    ALTER TABLE order_items ALTER COLUMN product_name DROP DEFAULT;
  END IF;
END $$;

-- Update RLS policies for orders to use is_admin column
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    customer_email = (auth.jwt() ->> 'email') OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Update RLS policies for order_items
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (
        orders.customer_email = (auth.jwt() ->> 'email') OR
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.is_admin = true
        )
      )
    )
  );

-- Update admin policies for custom orders
DROP POLICY IF EXISTS "Users can view their custom orders" ON custom_orders;
CREATE POLICY "Users can view their custom orders" ON custom_orders
  FOR SELECT USING (
    customer_email = (auth.jwt() ->> 'email') OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admin can update custom orders" ON custom_orders;
CREATE POLICY "Admin can update custom orders" ON custom_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Update admin policy for orders
DROP POLICY IF EXISTS "Admin can update orders" ON orders;
CREATE POLICY "Admin can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Fix customer_order_history view to use product_name
DROP VIEW IF EXISTS customer_order_history;
CREATE OR REPLACE VIEW customer_order_history AS
SELECT 
  o.id,
  o.customer_name,
  o.customer_email,
  o.customer_phone,
  o.delivery_address,
  o.status,
  o.total_amount,
  o.payment_status,
  o.created_at,
  json_agg(
    json_build_object(
      'product_name', oi.product_name,
      'quantity', oi.quantity,
      'price', oi.price
    )
  ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- Update the admin user (replace with your admin email)
-- IMPORTANT: Run this after applying the migration with your actual admin email
-- UPDATE profiles SET is_admin = true WHERE email = 'muindidamian@gmail.com';

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
