-- Mise à jour de la vue global_stats pour utiliser la table payments
DROP VIEW IF EXISTS global_stats;

CREATE VIEW global_stats AS
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM events) as total_events,
  (SELECT COUNT(*) FROM photos) as total_photos,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') as estimated_revenue;
