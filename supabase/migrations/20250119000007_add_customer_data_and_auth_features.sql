-- Add username and avatar to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Create customer_data table to store customer information from orders
CREATE TABLE IF NOT EXISTS customer_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for customer_data
CREATE INDEX IF NOT EXISTS idx_customer_data_user_id ON customer_data(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_data_email ON customer_data(email);
CREATE INDEX IF NOT EXISTS idx_customer_data_phone ON customer_data(phone);

-- Enable Row Level Security
ALTER TABLE customer_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own customer data
CREATE POLICY "Users can view own customer data"
ON customer_data FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own customer data
CREATE POLICY "Users can insert own customer data"
ON customer_data FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own customer data
CREATE POLICY "Users can update own customer data"
ON customer_data FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create password_history table to track password changes
CREATE TABLE IF NOT EXISTS password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_created_at ON password_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own password history
CREATE POLICY "Users can view own password history"
ON password_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Only system can insert password history
CREATE POLICY "System can insert password history"
ON password_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger for customer_data
CREATE OR REPLACE FUNCTION update_customer_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_data_updated_at
BEFORE UPDATE ON customer_data
FOR EACH ROW
EXECUTE FUNCTION update_customer_data_updated_at();

-- Function to save customer data from orders
CREATE OR REPLACE FUNCTION save_customer_data_from_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update customer_data when an order is placed
  INSERT INTO customer_data (user_id, email, phone, address)
  VALUES (
    (SELECT id FROM auth.users WHERE email = NEW.customer_email LIMIT 1),
    NEW.customer_email,
    NEW.customer_phone,
    NEW.delivery_address
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to save customer data when order is created
DROP TRIGGER IF EXISTS save_customer_data_on_order ON orders;
CREATE TRIGGER save_customer_data_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.customer_email IS NOT NULL)
  EXECUTE FUNCTION save_customer_data_from_order();

-- Function to track password changes
CREATE OR REPLACE FUNCTION track_password_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if password actually changed
  IF NEW.encrypted_password != OLD.encrypted_password THEN
    INSERT INTO password_history (user_id, password_hash)
    VALUES (NEW.id, NEW.encrypted_password);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track password changes
DROP TRIGGER IF EXISTS track_password_on_auth_users ON auth.users;
CREATE TRIGGER track_password_on_auth_users
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION track_password_change();

-- Function to check if password was previously used
CREATE OR REPLACE FUNCTION check_previous_password(
  p_user_id UUID,
  p_password_hash TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM password_history 
    WHERE user_id = p_user_id 
    AND password_hash = p_password_hash
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_previous_password(UUID, TEXT) TO authenticated;
