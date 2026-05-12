-- Ajout des colonnes manquantes sur la table events pour la gestion des défis invités et du compteur de capacité
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS allow_guest_challenges BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS joined_guests_count INT DEFAULT 1;

-- Instruction PostgREST pour forcer le rechargement immédiat du cache de schéma Supabase
NOTIFY pgrst, 'reload schema';
