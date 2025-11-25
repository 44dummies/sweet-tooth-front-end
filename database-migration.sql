-- Sweet Tooth Pastries - Database Migration
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. Products Table Updates
-- =====================================================

-- Add on_offer column for special offers/deals
ALTER TABLE products ADD COLUMN IF NOT EXISTS on_offer BOOLEAN DEFAULT false;

-- Ensure in_stock column exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;

-- Add stock_quantity if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 10;

-- =====================================================
-- 2. Profiles Table Updates
-- =====================================================

-- Ensure avatar_url column exists (preferred over 'avatar')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add last_active_at for session tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 3. Orders Table Updates (for GPS delivery)
-- =====================================================

-- Add delivery coordinates columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lat DECIMAL(10, 8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lng DECIMAL(11, 8);

-- Add notification tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_by TEXT;

-- =====================================================
-- 4. Reviews Table Updates
-- =====================================================

-- Ensure approved column exists for moderation
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- =====================================================
-- 5. Conversations Table (for live chat)
-- =====================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL UNIQUE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unread_admin_count INTEGER DEFAULT 0,
  unread_customer_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_email ON conversations(customer_email);

-- =====================================================
-- 6. Conversation Messages Table
-- =====================================================

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON conversation_messages(created_at);

-- =====================================================
-- 7. Custom Orders Table (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS custom_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  cake_size TEXT,
  cake_flavor TEXT,
  cake_type TEXT,
  delivery_date DATE,
  special_requests TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. Enable Real-time for new tables
-- =====================================================

-- Enable realtime for conversations (ignore if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_messages;
  END IF;
END $$;

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
-- 9. Row Level Security (RLS) Policies
-- =====================================================

-- Conversations: Users can only see their own conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (customer_email = auth.jwt() ->> 'email');

-- Admin can see all (add your admin email)
CREATE POLICY "Admin can view all conversations" ON conversations
  FOR ALL USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- Messages: Users can only see messages from their conversations
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON conversation_messages
  FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own messages" ON conversation_messages
  FOR INSERT WITH CHECK (customer_email = auth.jwt() ->> 'email');

-- Admin can see all messages
CREATE POLICY "Admin can manage all messages" ON conversation_messages
  FOR ALL USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- =====================================================
-- Done! Your database is now ready.
-- =====================================================
