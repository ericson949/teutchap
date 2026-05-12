-- ====================================================================
-- POLITIQUES DE SUPPORT POUR LE "SHADOW LOGIN" (SESSIONS ANONYMES)
-- ====================================================================

-- Autorise l'insertion publique/anonyme dans la table users pour initialiser le compte Shadow
CREATE POLICY "Anyone can create a shadow profile"
ON users FOR INSERT WITH CHECK (true);

-- Autorise la lecture publique des profils (nécessaire pour résoudre les relations d'événements)
CREATE POLICY "Public profiles are viewable by everyone"
ON users FOR SELECT USING (true);

-- Autorise la mise à jour de son propre profil (ex: lors de la conversion future vers un compte lié)
CREATE POLICY "Users can update their shadow profile"
ON users FOR UPDATE USING (true);

-- Purge du cache PostgREST
NOTIFY pgrst, 'reload schema';
