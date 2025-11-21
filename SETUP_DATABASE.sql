-- Sweet Tooth Pastries - Complete Database Setup
-- Run this script in your Supabase SQL Editor to ensure all tables exist

-- ============================================
-- TABLES
-- ============================================

-- Orders table (menu cart checkout)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  delivery_address TEXT,
  delivery_date DATE,
  special_instructions TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom orders table
CREATE TABLE IF NOT EXISTS custom_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  cake_size TEXT NOT NULL,
  cake_flavor TEXT NOT NULL,
  cake_type TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  special_requests TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'Kenya',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('EMAIL', 'WHATSAPP', 'SMS')),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
  order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products/Menu items table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer messages table (from FloatingChat)
CREATE TABLE IF NOT EXISTS customer_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  admin_reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password history table
CREATE TABLE IF NOT EXISTS password_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer data table
CREATE TABLE IF NOT EXISTS customer_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_email ON custom_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON custom_orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_created_at ON custom_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_customer_messages_status ON customer_messages(status);
CREATE INDEX IF NOT EXISTS idx_customer_messages_created_at ON customer_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_messages_email ON customer_messages(customer_email);
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_data_user_id ON customer_data(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_data ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - ORDERS
-- ============================================

DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
CREATE POLICY "Anyone can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    customer_email = (auth.jwt() ->> 'email') OR
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

DROP POLICY IF EXISTS "Admin can update orders" ON orders;
CREATE POLICY "Admin can update orders" ON orders
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- ============================================
-- RLS POLICIES - ORDER ITEMS
-- ============================================

DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
CREATE POLICY "Anyone can insert order items" ON order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.customer_email = (auth.jwt() ->> 'email') OR auth.jwt() ->> 'email' = 'muindidamian@gmail.com')
    )
  );

-- ============================================
-- RLS POLICIES - CUSTOM ORDERS
-- ============================================

DROP POLICY IF EXISTS "Anyone can insert custom orders" ON custom_orders;
CREATE POLICY "Anyone can insert custom orders" ON custom_orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their custom orders" ON custom_orders;
CREATE POLICY "Users can view their custom orders" ON custom_orders
  FOR SELECT USING (
    customer_email = (auth.jwt() ->> 'email') OR
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

DROP POLICY IF EXISTS "Admin can update custom orders" ON custom_orders;
CREATE POLICY "Admin can update custom orders" ON custom_orders
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- ============================================
-- RLS POLICIES - REVIEWS
-- ============================================

DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
CREATE POLICY "Anyone can insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
CREATE POLICY "Anyone can view approved reviews" ON reviews
  FOR SELECT USING (approved = true OR auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

DROP POLICY IF EXISTS "Admin can update reviews" ON reviews;
CREATE POLICY "Admin can update reviews" ON reviews
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

DROP POLICY IF EXISTS "Admin can delete reviews" ON reviews;
CREATE POLICY "Admin can delete reviews" ON reviews
  FOR DELETE USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- ============================================
-- RLS POLICIES - NOTIFICATIONS
-- ============================================

DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;
CREATE POLICY "Anyone can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view notifications" ON notifications;
CREATE POLICY "Admin can view notifications" ON notifications
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- ============================================
-- RLS POLICIES - PRODUCTS
-- ============================================

DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage products" ON products;
CREATE POLICY "Admin can manage products" ON products
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- ============================================
-- RLS POLICIES - PAYMENTS
-- ============================================

DROP POLICY IF EXISTS "Anyone can insert payments" ON payments;
CREATE POLICY "Anyone can insert payments" ON payments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their payments" ON payments;
CREATE POLICY "Users can view their payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payments.order_id 
      AND (orders.customer_email = (auth.jwt() ->> 'email') OR auth.jwt() ->> 'email' = 'muindidamian@gmail.com')
    )
  );

-- ============================================
-- RLS POLICIES - CUSTOMER MESSAGES
-- ============================================

DROP POLICY IF EXISTS "Anyone can insert messages" ON customer_messages;
CREATE POLICY "Anyone can insert messages" ON customer_messages
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view all messages" ON customer_messages;
CREATE POLICY "Admin can view all messages" ON customer_messages
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

DROP POLICY IF EXISTS "Admin can update messages" ON customer_messages;
CREATE POLICY "Admin can update messages" ON customer_messages
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- ============================================
-- RLS POLICIES - PASSWORD HISTORY
-- ============================================

DROP POLICY IF EXISTS "Users can manage their password history" ON password_history;
CREATE POLICY "Users can manage their password history" ON password_history
  FOR ALL USING (
    user_id = auth.uid()
  );

-- ============================================
-- RLS POLICIES - CUSTOMER DATA
-- ============================================

DROP POLICY IF EXISTS "Users can manage their customer data" ON customer_data;
CREATE POLICY "Users can manage their customer data" ON customer_data
  FOR ALL USING (
    user_id = auth.uid() OR
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment below to add sample products
/*
INSERT INTO products (name, category, price, description, in_stock, stock_quantity) VALUES
('Vanilla Cupcake', 'Cupcakes', 150.00, 'Classic vanilla cupcake with buttercream frosting', true, 50),
('Chocolate Cake', 'Cakes', 2500.00, 'Rich chocolate layer cake', true, 10),
('Red Velvet Cupcake', 'Cupcakes', 180.00, 'Red velvet with cream cheese frosting', true, 30),
('Birthday Cake', 'Cakes', 3000.00, 'Custom birthday cake', true, 5)
ON CONFLICT DO NOTHING;
*/
