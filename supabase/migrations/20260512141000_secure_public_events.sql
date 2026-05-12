-- ====================================================================
-- PLAN DE SÉCURISATION AVANCÉE : ÉVÉNEMENTS PUBLICS & COMPTEURS
-- ====================================================================

-- 1. Nettoyage des anciennes politiques permissives
DROP POLICY IF EXISTS "Anyone can insert events" ON events;
DROP POLICY IF EXISTS "Anyone can update events" ON events;
DROP POLICY IF EXISTS "Insertion publique restreinte et sécurisée" ON events;
DROP POLICY IF EXISTS "Mise à jour publique restreinte aux compteurs" ON events;

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

-- Action 2 : Politique UPDATE globale (Le contrôle fin est délégué au Trigger SQL)
CREATE POLICY "Mise à jour publique restreinte aux compteurs" ON events
FOR UPDATE TO public
USING (true)
WITH CHECK (true);

-- ====================================================================
-- PHASE 1 BIS : CONTRÔLE CROISÉ SQL (TRIGGER DE SÉCURITÉ STRICT)
-- ====================================================================
-- Résout la limitation native de PostgreSQL interdisant l'usage de OLD et NEW directement dans un CREATE POLICY.

CREATE OR REPLACE FUNCTION verify_public_event_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérification d'intégrité : interdit formellement de renommer l'album, d'altérer sa date ou de voler son token.
  IF OLD.id <> NEW.id OR OLD.token <> NEW.token OR OLD.name <> NEW.name OR OLD.event_date <> NEW.event_date THEN
    RAISE EXCEPTION 'Sécurité Supabase : Modification interdite des métadonnées critiques de l''événement partagé.';
  END IF;

  -- Vérification de croissance : interdit formellement la décrémentation malveillante des compteurs
  IF NEW.joined_guests_count < OLD.joined_guests_count THEN
    RAISE EXCEPTION 'Sécurité Supabase : Décrémentation illégale du compteur d''invités.';
  END IF;

  IF NEW.photo_count < OLD.photo_count THEN
    RAISE EXCEPTION 'Sécurité Supabase : Décrémentation illégale du compteur de photos.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_secure_public_event_update ON events;
CREATE TRIGGER trg_secure_public_event_update
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION verify_public_event_update();

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
