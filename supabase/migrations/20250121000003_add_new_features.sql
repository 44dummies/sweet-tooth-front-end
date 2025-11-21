-- Gift Cards/Vouchers Table
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance DECIMAL(10, 2) NOT NULL,
  purchaser_email TEXT,
  purchaser_name TEXT,
  recipient_email TEXT,
  recipient_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_gift_cards_status ON gift_cards(status);

-- Gift Card Transactions
CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_card_id UUID REFERENCES gift_cards(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('purchase', 'redemption', 'refund')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites/Wishlist Table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_email, product_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_email);
CREATE INDEX idx_favorites_product ON favorites(product_id);

-- Availability Calendar (for custom orders)
CREATE TABLE IF NOT EXISTS availability_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_capacity INTEGER DEFAULT 10,
  booked_slots INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_availability_date ON availability_calendar(date);

-- Delivery Zones
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_name TEXT NOT NULL,
  areas TEXT[] NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  estimated_time_min INTEGER NOT NULL, -- in minutes
  estimated_time_max INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add nutritional info columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS calories INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS allergens TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS dietary_tags TEXT[]; -- ['vegan', 'gluten-free', 'sugar-free', 'dairy-free']
ALTER TABLE products ADD COLUMN IF NOT EXISTS serving_size TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS nutritional_info JSONB; -- {protein: '5g', carbs: '30g', fat: '15g', etc}

-- Cake Size Guide
CREATE TABLE IF NOT EXISTS cake_size_guide (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  size_name TEXT NOT NULL,
  serves_min INTEGER NOT NULL,
  serves_max INTEGER NOT NULL,
  diameter_inches INTEGER,
  layers INTEGER DEFAULT 2,
  price_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default cake sizes
INSERT INTO cake_size_guide (size_name, serves_min, serves_max, diameter_inches, layers, price_multiplier, description)
VALUES 
  ('Small', 8, 12, 6, 2, 1.0, 'Perfect for intimate gatherings'),
  ('Medium', 15, 20, 8, 2, 1.5, 'Great for small parties'),
  ('Large', 25, 30, 10, 2, 2.0, 'Ideal for celebrations'),
  ('Extra Large', 35, 45, 12, 2, 2.5, 'Perfect for big events'),
  ('Sheet Cake', 50, 60, 0, 1, 3.0, 'Best for large gatherings')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cake_size_guide ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Gift Cards
CREATE POLICY "Anyone can view active gift cards by code" ON gift_cards
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admin can manage gift cards" ON gift_cards
  FOR ALL USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- RLS Policies for Favorites
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can add to their favorites" ON favorites
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can remove from their favorites" ON favorites
  FOR DELETE USING (user_email = auth.jwt() ->> 'email');

-- RLS Policies for Availability Calendar
CREATE POLICY "Anyone can view availability" ON availability_calendar
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage availability" ON availability_calendar
  FOR ALL USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- RLS Policies for Delivery Zones
CREATE POLICY "Anyone can view active delivery zones" ON delivery_zones
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage delivery zones" ON delivery_zones
  FOR ALL USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- RLS Policies for Cake Size Guide
CREATE POLICY "Anyone can view cake sizes" ON cake_size_guide
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage cake sizes" ON cake_size_guide
  FOR ALL USING (auth.jwt() ->> 'email' = 'muindidamian@gmail.com');

-- Function to auto-update availability based on bookings
CREATE OR REPLACE FUNCTION update_availability_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE availability_calendar
  SET booked_slots = booked_slots + 1,
      is_available = (booked_slots + 1) < total_capacity,
      updated_at = NOW()
  WHERE date = NEW.delivery_date::DATE;
  
  -- Create date if doesn't exist
  INSERT INTO availability_calendar (date, booked_slots, is_available)
  VALUES (NEW.delivery_date::DATE, 1, true)
  ON CONFLICT (date) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_availability_after_custom_order
  AFTER INSERT ON custom_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_on_booking();
