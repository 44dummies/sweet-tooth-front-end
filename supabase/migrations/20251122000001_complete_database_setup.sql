-- Complete Database Setup Migration for Sweet Tooth Pastries
-- This migration creates all necessary tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL,
    image_key TEXT,
    available BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    delivery_date DATE,
    special_instructions TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOM_ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS custom_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    cake_type TEXT NOT NULL,
    servings TEXT,
    flavor TEXT,
    delivery_date DATE,
    budget TEXT,
    special_requests TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    avatar TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    bio TEXT,
    is_admin BOOLEAN DEFAULT false,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VISITOR_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS visitor_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    country TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    referrer TEXT,
    landing_page TEXT,
    visit_duration INTEGER DEFAULT 0,
    pages_viewed INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAGE_VIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    time_spent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- ============================================
-- CUSTOMER_MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customer_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT,
    user_email TEXT,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    unread_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONVERSATION_MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_type TEXT NOT NULL, -- 'customer' or 'admin'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    transaction_id TEXT,
    payment_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMER_DATA TABLE (for password reset)
-- ============================================
CREATE TABLE IF NOT EXISTS customer_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    phone TEXT,
    security_question TEXT,
    security_answer_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PASSWORD_HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AVAILABILITY_CALENDAR TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS availability_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    available BOOLEAN DEFAULT true,
    capacity INTEGER DEFAULT 5,
    booked INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GIFT_CARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gift_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL,
    recipient_email TEXT,
    recipient_name TEXT,
    sender_name TEXT,
    message TEXT,
    status TEXT DEFAULT 'active',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GIFT_CARD_TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gift_card_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gift_card_id UUID REFERENCES gift_cards(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id),
    transaction_type TEXT NOT NULL, -- 'purchase', 'redeem', 'refund'
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAKE_SIZE_GUIDE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cake_size_guide (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    size TEXT NOT NULL,
    servings TEXT NOT NULL,
    diameter TEXT,
    height TEXT,
    price_range TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DELIVERY_ZONES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    areas TEXT[] NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2),
    estimated_time TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cake_size_guide ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
    -- Products policies
    DROP POLICY IF EXISTS "Public can view products" ON products;
    DROP POLICY IF EXISTS "Admins can do everything on products" ON products;
    
    -- Reviews policies
    DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
    DROP POLICY IF EXISTS "Public can insert reviews" ON reviews;
    DROP POLICY IF EXISTS "Admins can do everything on reviews" ON reviews;
    
    -- Profiles policies
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
    
    -- Orders policies
    DROP POLICY IF EXISTS "Users can view own orders" ON orders;
    DROP POLICY IF EXISTS "Public can insert orders" ON orders;
    DROP POLICY IF EXISTS "Admins can do everything on orders" ON orders;
    
    -- Favorites policies
    DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
    DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
    DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
    
    -- Other policies
    DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
    DROP POLICY IF EXISTS "Public can insert custom orders" ON custom_orders;
    DROP POLICY IF EXISTS "Public can insert visitor logs" ON visitor_logs;
    DROP POLICY IF EXISTS "Public can update visitor logs" ON visitor_logs;
    DROP POLICY IF EXISTS "Public can insert page views" ON page_views;
    DROP POLICY IF EXISTS "Public can insert customer messages" ON customer_messages;
    DROP POLICY IF EXISTS "Public can insert order items" ON order_items;
    DROP POLICY IF EXISTS "Public can view cake size guide" ON cake_size_guide;
    DROP POLICY IF EXISTS "Public can view delivery zones" ON delivery_zones;
    DROP POLICY IF EXISTS "Public can view availability" ON availability_calendar;
END $$;

-- Public read policies
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can view approved reviews" ON reviews FOR SELECT USING (approved = true);
CREATE POLICY "Public can view cake size guide" ON cake_size_guide FOR SELECT USING (true);
CREATE POLICY "Public can view delivery zones" ON delivery_zones FOR SELECT USING (active = true);
CREATE POLICY "Public can view availability" ON availability_calendar FOR SELECT USING (true);

-- Authenticated user policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (customer_email = auth.jwt() ->> 'email');
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);

-- Public insert policies
CREATE POLICY "Public can insert custom orders" ON custom_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert visitor logs" ON visitor_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update visitor logs" ON visitor_logs FOR UPDATE USING (true);
CREATE POLICY "Public can insert page views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert customer messages" ON customer_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- Admin policies (you'll need to set is_admin = true for admin users)
CREATE POLICY "Admins can do everything on products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can do everything on orders" ON orders FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can do everything on reviews" ON reviews FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_orders_updated_at ON custom_orders;
CREATE TRIGGER update_custom_orders_updated_at BEFORE UPDATE ON custom_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, first_name, created_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_session_id ON visitor_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

-- ============================================
-- INSERT SAMPLE DATA (Optional)
-- ============================================

-- Sample products (if table is empty)
INSERT INTO products (title, description, price, category, image_key, available, stock_quantity)
SELECT * FROM (VALUES
    ('Chocolate Birthday Cake', 'Rich chocolate cake with chocolate ganache frosting', 35.00, 'birthday-cakes', 'birthday-cakes', true, 10),
    ('Vanilla Wedding Cake', 'Elegant 3-tier vanilla cake with buttercream', 250.00, 'wedding-cakes', 'hero-cake-1', true, 5),
    ('Red Velvet Cupcakes', 'Set of 12 red velvet cupcakes with cream cheese frosting', 24.00, 'cupcakes', 'cupcakes', true, 20),
    ('Cinnamon Rolls', 'Freshly baked cinnamon rolls with cream cheese glaze', 18.00, 'pastries', 'cinnamon-rolls', true, 15),
    ('Chocolate Brownies', 'Fudgy chocolate brownies - pack of 6', 12.00, 'brownies', 'brownies', true, 25),
    ('Sugar Cookies', 'Decorated sugar cookies - pack of 12', 15.00, 'cookies', 'cookies', true, 30)
) AS v(title, description, price, category, image_key, available, stock_quantity)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- Sample cake size guide
INSERT INTO cake_size_guide (size, servings, diameter, height, price_range, description)
SELECT * FROM (VALUES
    ('Small', '10-15 people', '6 inches', '3-4 inches', 'Ksh 2,000 - 4,000', 'Perfect for intimate gatherings'),
    ('Medium', '20-30 people', '8 inches', '3-4 inches', 'Ksh 4,000 - 7,000', 'Great for small parties'),
    ('Large', '40-50 people', '10 inches', '3-4 inches', 'Ksh 7,000 - 12,000', 'Ideal for large celebrations'),
    ('Extra Large', '60-80 people', '12 inches', '3-4 inches', 'Ksh 12,000 - 18,000', 'Perfect for big events'),
    ('Multi-Tier', '100+ people', 'Various', 'Various', 'Ksh 20,000+', 'Custom multi-tier wedding cakes')
) AS v(size, servings, diameter, height, price_range, description)
WHERE NOT EXISTS (SELECT 1 FROM cake_size_guide LIMIT 1);

-- Sample delivery zones
INSERT INTO delivery_zones (name, areas, delivery_fee, min_order_amount, estimated_time, active)
SELECT * FROM (VALUES
    ('Zone 1 - City Center', ARRAY['Downtown', 'CBD', 'Westlands'], 200.00, 1000.00, '30-45 mins', true),
    ('Zone 2 - Suburbs', ARRAY['Karen', 'Lavington', 'Kilimani'], 300.00, 1500.00, '45-60 mins', true),
    ('Zone 3 - Extended', ARRAY['Ngong', 'Rongai', 'Kitengela'], 500.00, 2000.00, '60-90 mins', true)
) AS v(name, areas, delivery_fee, min_order_amount, estimated_time, active)
WHERE NOT EXISTS (SELECT 1 FROM delivery_zones LIMIT 1);

COMMENT ON TABLE products IS 'Store product catalog including cakes, pastries, and desserts';
COMMENT ON TABLE orders IS 'Customer orders with delivery and payment information';
COMMENT ON TABLE custom_orders IS 'Custom cake orders with specific requirements';
COMMENT ON TABLE profiles IS 'User profiles linked to authentication';
COMMENT ON TABLE reviews IS 'Customer reviews and ratings for products';
COMMENT ON TABLE favorites IS 'User wishlist/favorites';
COMMENT ON TABLE conversations IS 'Customer support chat conversations';
COMMENT ON TABLE notifications IS 'User notifications for orders and updates';
