-- Create visitor_logs table
CREATE TABLE IF NOT EXISTS visitor_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT, -- Unique identifier for the visitor (generated client-side)
  ip_address TEXT,
  user_agent TEXT,
  page_url TEXT,
  referrer TEXT,
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  session_id TEXT,
  visit_duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_visitor_logs_created_at ON visitor_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_visitor_id ON visitor_logs(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_session_id ON visitor_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_page_url ON visitor_logs(page_url);

-- Create page_views table for tracking individual page visits
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT,
  session_id TEXT,
  page_url TEXT NOT NULL,
  page_title TEXT,
  time_on_page INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for page_views
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

-- Enable Row Level Security
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert visitor logs
CREATE POLICY "Anyone can log visits"
ON visitor_logs FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Anyone can insert page views
CREATE POLICY "Anyone can log page views"
ON page_views FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Authenticated users (admin) can view all logs
CREATE POLICY "Admins can view visitor logs"
ON visitor_logs FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users (admin) can view all page views
CREATE POLICY "Admins can view page views"
ON page_views FOR SELECT
TO authenticated
USING (true);

-- Create visitor_stats view for analytics
CREATE OR REPLACE VIEW visitor_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  COUNT(*) as total_visits,
  COUNT(DISTINCT session_id) as total_sessions,
  AVG(visit_duration) as avg_duration
FROM visitor_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Grant access to view for authenticated users
GRANT SELECT ON visitor_stats TO authenticated;
