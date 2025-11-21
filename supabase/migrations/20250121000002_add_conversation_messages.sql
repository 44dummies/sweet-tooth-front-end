-- Create conversation_messages table for two-way chat between admin and customers
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  customer_email TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_conversation_messages_conversation ON conversation_messages(conversation_id);
CREATE INDEX idx_conversation_messages_customer ON conversation_messages(customer_email);
CREATE INDEX idx_conversation_messages_created ON conversation_messages(created_at DESC);

-- Enable RLS
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can insert messages" ON conversation_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers can view their own messages" ON conversation_messages
  FOR SELECT USING (
    customer_email = auth.jwt() ->> 'email'
  );

CREATE POLICY "Admin can view all messages" ON conversation_messages
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

CREATE POLICY "Admin can update messages" ON conversation_messages
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

-- Create conversations table to track active conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unread_admin_count INTEGER DEFAULT 0,
  unread_customer_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_email ON conversations(customer_email);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create conversations" ON conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers can view their own conversations" ON conversations
  FOR SELECT USING (
    customer_email = auth.jwt() ->> 'email'
  );

CREATE POLICY "Admin can view all conversations" ON conversations
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

CREATE POLICY "Admin can update conversations" ON conversations
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );
