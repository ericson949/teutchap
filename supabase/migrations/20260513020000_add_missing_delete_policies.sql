-- ====================================================================
-- CORRECTION DES POLITIQUES RLS : SUPPRESSION SUR REACTIONS ET PHOTOS
-- Autorise les invités/contributeurs à retirer leurs réactions exclusives
-- et à exercer leur droit à l'oubli sur leurs photos.
-- ====================================================================

-- 1. Politique DELETE sur la table reactions
CREATE POLICY "Anyone can delete reactions"
ON reactions FOR DELETE USING (true);

-- 2. Politique DELETE sur la table photos
CREATE POLICY "Anyone can delete photos"
ON photos FOR DELETE USING (true);

-- Notification PostgREST pour rechargement immédiat du cache du schéma
NOTIFY pgrst, 'reload schema';
