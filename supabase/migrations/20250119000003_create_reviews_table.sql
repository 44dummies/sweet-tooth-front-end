-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert reviews (submit)
CREATE POLICY "Anyone can submit reviews"
ON reviews FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews"
ON reviews FOR SELECT
TO public
USING (approved = true);

-- Policy: Authenticated users (admin) can view all reviews
CREATE POLICY "Admins can view all reviews"
ON reviews FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users (admin) can update reviews (approve/reject)
CREATE POLICY "Admins can update reviews"
ON reviews FOR UPDATE
TO authenticated
USING (true);

-- Policy: Authenticated users (admin) can delete reviews
CREATE POLICY "Admins can delete reviews"
ON reviews FOR DELETE
TO authenticated
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_reviews_updated_at();
