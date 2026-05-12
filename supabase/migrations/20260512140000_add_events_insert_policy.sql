-- Autoriser l'insertion publique (anonyme) d'événements pour le parcours de création rapide sans friction
CREATE POLICY "Anyone can insert events"
ON events FOR INSERT WITH CHECK (true);

-- Autoriser la mise à jour publique d'événements (nécessaire pour l'incrémentation en direct du compteur d'invités)
CREATE POLICY "Anyone can update events"
ON events FOR UPDATE USING (true);
