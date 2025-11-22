-- Add user_email column to orders table for push notifications
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);

-- Add notification_sent column to track if user has been notified
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_by TEXT;

-- Create a trigger to update confirmed_at when status changes to CONFIRMED
CREATE OR REPLACE FUNCTION update_confirmed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CONFIRMED' AND OLD.status != 'CONFIRMED' THEN
    NEW.confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_confirmed_at ON orders;
CREATE TRIGGER set_confirmed_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_confirmed_at();
