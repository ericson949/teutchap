-- ====================================================================
-- ENRICHISSEMENT DU SCHÉMA : HORAIRES, SÉCURITÉ & COLLABORATION
-- ====================================================================

-- 1. Ajout des colonnes sur la table events
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS start_time TEXT,
  ADD COLUMN IF NOT EXISTS end_time TEXT,
  ADD COLUMN IF NOT EXISTS access_password TEXT,
  ADD COLUMN IF NOT EXISTS co_admins TEXT[] DEFAULT '{}';

-- 2. Affinement du Trigger SQL de sécurité globale pour la table events
-- Exempte le propriétaire légitime et les co-administrateurs des restrictions d'écriture publiques.

CREATE OR REPLACE FUNCTION verify_public_event_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'utilisateur appelant est le propriétaire légitime ou fait partie des co-administrateurs, on accorde l'accès complet
  IF auth.uid() IS NOT NULL AND (auth.uid() = OLD.user_id OR auth.uid()::text = ANY(OLD.co_admins)) THEN
    RETURN NEW;
  END IF;

  -- Sinon, il s'agit d'une requête publique ou anonyme tierce (ex: incrémentation d'invité)
  -- Vérification d'intégrité stricte : interdit d'altérer les métadonnées (nom, date, token, mot de passe, admins)
  IF OLD.id <> NEW.id OR 
     OLD.token <> NEW.token OR 
     OLD.name <> NEW.name OR 
     OLD.event_date <> NEW.event_date OR 
     COALESCE(OLD.access_password, '') <> COALESCE(NEW.access_password, '') OR
     OLD.co_admins <> NEW.co_admins THEN
    RAISE EXCEPTION 'Sécurité Supabase : Altération publique interdite des métadonnées ou de la sécurité de l''événement.';
  END IF;

  -- Vérification de croissance : interdit de diminuer les compteurs
  IF NEW.joined_guests_count < OLD.joined_guests_count THEN
    RAISE EXCEPTION 'Sécurité Supabase : Décrémentation illégale du compteur d''invités.';
  END IF;

  IF NEW.photo_count < OLD.photo_count THEN
    RAISE EXCEPTION 'Sécurité Supabase : Décrémentation illégale du compteur de photos.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rechargement du cache de schéma Supabase
NOTIFY pgrst, 'reload schema';
