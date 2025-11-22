-- Ensure favorites table exists and is properly configured
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_email, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_email ON favorites(user_email);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_product ON favorites(user_email, product_id);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view favorites" ON favorites;
DROP POLICY IF EXISTS "Anyone can add favorites" ON favorites;
DROP POLICY IF EXISTS "Anyone can delete favorites" ON favorites;
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can add to their favorites" ON favorites;
DROP POLICY IF EXISTS "Users can remove from their favorites" ON favorites;

-- Create open policies for authenticated users
CREATE POLICY "Enable read access for all users" ON favorites
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON favorites
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON favorites
  FOR DELETE USING (true);

CREATE POLICY "Enable update access for all users" ON favorites
  FOR UPDATE USING (true);
