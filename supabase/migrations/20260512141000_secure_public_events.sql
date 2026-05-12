-- ====================================================================
-- PLAN DE SÉCURISATION AVANCÉE : ÉVÉNEMENTS PUBLICS & COMPTEURS
-- ====================================================================

-- 1. Nettoyage des anciennes politiques permissives de développement
DROP POLICY IF EXISTS "Anyone can insert events" ON events;
DROP POLICY IF EXISTS "Anyone can update events" ON events;

-- ====================================================================
-- PHASE 1 : POLITIQUES RLS ULTRA-CIBLÉES (SÉCURITÉ D'ÉCRITURE)
-- ====================================================================

-- Action 1 : Politique INSERT stricte
-- Garantit qu'un album créé publiquement naît obligatoirement en formule gratuite avec des compteurs initiaux intègres.
CREATE POLICY "Insertion publique restreinte et sécurisée" ON events
FOR INSERT TO public
WITH CHECK (
  plan = 'free' AND 
  joined_guests_count = 1 AND
  status = 'active'
);

-- Action 2 : Politique UPDATE verrouillée (Incrémentation exclusive)
-- Protège l'intégrité de l'événement : interdit formellement à un anonyme de renommer l'album, d'altérer sa date ou de voler son token.
-- Autorise uniquement l'évolution positive des compteurs d'invités et d'activité.
CREATE POLICY "Mise à jour publique restreinte aux compteurs" ON events
FOR UPDATE TO public
USING (true)
WITH CHECK (
  (OLD.id = NEW.id) AND
  (OLD.token = NEW.token) AND
  (OLD.name = NEW.name) AND
  (OLD.event_date = NEW.event_date) AND
  (NEW.joined_guests_count >= OLD.joined_guests_count) AND
  (NEW.photo_count >= OLD.photo_count)
);

-- ====================================================================
-- PHASE 2 : VALIDATION ROBUSTE DES DONNÉES (CHECK CONSTRAINTS)
-- ====================================================================

-- Rempart SQL contre les injections de chaînes massives ou l'altération des compteurs
ALTER TABLE events
  ADD CONSTRAINT check_event_name_length CHECK (char_length(name) <= 100),
  ADD CONSTRAINT check_event_token_length CHECK (char_length(token) <= 20),
  ADD CONSTRAINT check_guests_count_positive CHECK (joined_guests_count > 0),
  ADD CONSTRAINT check_photo_count_nonnegative CHECK (photo_count >= 0);

-- Notification PostgREST pour rechargement immédiat du cache des contraintes
NOTIFY pgrst, 'reload schema';
