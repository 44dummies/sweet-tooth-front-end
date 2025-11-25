-- =====================================================
-- SWEET TOOTH BAKERY - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Run this SQL in your Supabase SQL Editor after creating your project
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

-- =====================================================
-- 1. PROFILES TABLE (User profiles linked to auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- 2. ORDERS TABLE (Regular menu orders)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    delivery_address TEXT,
    delivery_date DATE,
    special_instructions TEXT,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    notification_sent BOOLEAN DEFAULT FALSE,
    confirmed_at TIMESTAMPTZ,
    confirmed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (
        user_id = auth.uid() OR 
        user_email = auth.jwt()->>'email'
    );

CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- 3. ORDER ITEMS TABLE (Items within each order)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies for order_items
CREATE POLICY "Users can view their order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.user_id = auth.uid() OR orders.user_email = auth.jwt()->>'email')
        )
    );

CREATE POLICY "Users can create order items" ON public.order_items
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all order items" ON public.order_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- 4. CUSTOM ORDERS TABLE (Custom cake requests)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.custom_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    cake_size TEXT NOT NULL,
    cake_flavor TEXT NOT NULL,
    cake_type TEXT NOT NULL,
    delivery_date DATE NOT NULL,
    special_requests TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

-- Policies for custom_orders
CREATE POLICY "Anyone can create custom orders" ON public.custom_orders
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can view their custom orders" ON public.custom_orders
    FOR SELECT USING (
        user_id = auth.uid() OR 
        customer_email = auth.jwt()->>'email'
    );

CREATE POLICY "Admins can manage all custom orders" ON public.custom_orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- 5. REVIEWS TABLE (Customer reviews)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    product_id UUID,
    approved BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "Anyone can view approved reviews" ON public.reviews
    FOR SELECT USING (approved = TRUE);

CREATE POLICY "Anyone can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all reviews" ON public.reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- 6. CUSTOMER MESSAGES TABLE (Contact form messages)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.customer_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    admin_reply TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.customer_messages ENABLE ROW LEVEL SECURITY;

-- Policies for customer_messages
CREATE POLICY "Anyone can send messages" ON public.customer_messages
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all messages" ON public.customer_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- 7. PAYMENTS TABLE (Payment records)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('BANK_TRANSFER', 'CASH', 'MPESA', 'CARD')),
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    transaction_id TEXT,
    payment_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for payments
CREATE POLICY "Users can view their payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = payments.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create payments" ON public.payments
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can manage all payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- 8. PASSWORD HISTORY TABLE (Security feature)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only insert their own password history
CREATE POLICY "Users can insert own password history" ON public.password_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 9. PRODUCTS TABLE (Menu items / Inventory)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- 10. FAVORITES / WISHLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    product_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policies for favorites
CREATE POLICY "Users can manage their favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 11. VISITOR ANALYTICS TABLE (Optional)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.visitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    page_path TEXT,
    visited_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (admins only)
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view visitor logs" ON public.visitor_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Anyone can insert visitor logs" ON public.visitor_logs
    FOR INSERT WITH CHECK (TRUE);

-- =====================================================
-- 12. CONVERSATIONS TABLE (Live Chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    unread_admin_count INTEGER DEFAULT 0,
    unread_customer_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can view their own conversations" ON public.conversations
    FOR SELECT USING (
        customer_email = auth.jwt()->>'email'
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        customer_email = auth.jwt()->>'email'
    );

CREATE POLICY "Users can update their conversations" ON public.conversations
    FOR UPDATE USING (
        customer_email = auth.jwt()->>'email'
    );

CREATE POLICY "Admins can manage all conversations" ON public.conversations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- 13. CONVERSATION MESSAGES TABLE (Live Chat Messages)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    customer_email TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- Policies for conversation_messages
CREATE POLICY "Users can view messages in their conversations" ON public.conversation_messages
    FOR SELECT USING (
        customer_email = auth.jwt()->>'email'
    );

CREATE POLICY "Users can insert messages in their conversations" ON public.conversation_messages
    FOR INSERT WITH CHECK (
        customer_email = auth.jwt()->>'email'
    );

CREATE POLICY "Users can update their own messages" ON public.conversation_messages
    FOR UPDATE USING (
        customer_email = auth.jwt()->>'email'
    );

CREATE POLICY "Admins can manage all messages" ON public.conversation_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_custom_orders_updated_at
    BEFORE UPDATE ON public.custom_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ENABLE REALTIME FOR ADMIN DASHBOARD
-- =====================================================
-- Run these in Supabase Dashboard > Database > Replication

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;

-- =====================================================
-- CREATE ADMIN USER (Run after your first signup)
-- =====================================================
-- Replace 'your-email@example.com' with your actual email after signing up
-- UPDATE public.profiles SET is_admin = TRUE WHERE email = 'muindidamian@gmail.com';

-- =====================================================
-- SAMPLE PRODUCTS DATA (Optional)
-- =====================================================
INSERT INTO public.products (name, description, category, price, in_stock, stock_quantity) VALUES
    ('Cinnamon Rolls', 'Warm, gooey cinnamon rolls topped with cream cheese frosting', 'Pastries', 1500, TRUE, 50),
    ('Brownies', 'Rich, fudgy chocolate brownies with crispy top', 'Desserts', 1500, TRUE, 40),
    ('Cookies', 'Assorted cookies - chocolate chip, oatmeal raisin, sugar', 'Cookies', 700, TRUE, 100),
    ('Cake Pops', 'Adorable bite-sized cake pops with colorful coating', 'Desserts', 1200, TRUE, 60),
    ('Cupcakes', 'Beautifully decorated cupcakes with buttercream', 'Cakes', 1200, TRUE, 80),
    ('Banana Bread', 'Moist banana bread made with ripe bananas', 'Bread', 1800, TRUE, 30),
    ('Fruitcake', 'Traditional fruitcake with candied fruits and nuts', 'Cakes', 2000, TRUE, 20),
    ('Birthday Cakes', 'Custom birthday cakes for celebrations', 'Cakes', 2000, TRUE, 15)
ON CONFLICT DO NOTHING;

-- =====================================================
-- DONE! Your database is ready.
-- =====================================================
