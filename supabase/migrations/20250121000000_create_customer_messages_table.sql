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

CREATE INDEX idx_customer_messages_status ON customer_messages(status);
CREATE INDEX idx_customer_messages_created_at ON customer_messages(created_at DESC);
CREATE INDEX idx_customer_messages_email ON customer_messages(customer_email);

ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert messages" ON customer_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view all messages" ON customer_messages
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );

CREATE POLICY "Admin can update messages" ON customer_messages
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = 'muindidamian@gmail.com'
  );
