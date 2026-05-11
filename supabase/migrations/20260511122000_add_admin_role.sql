-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create a view for global statistics (accessible by admins)
CREATE OR REPLACE VIEW global_stats AS
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM events) as total_events,
  (SELECT COUNT(*) FROM photos) as total_photos,
  (SELECT COALESCE(SUM(CASE WHEN plan = 'premium' THEN 5000 WHEN plan = 'vip' THEN 15000 ELSE 0 END), 0) FROM events) as estimated_revenue;
