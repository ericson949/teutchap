-- ====================================================================
-- CRÉATION DE LA TABLE PIVOT POUR LA GESTION RELATIONNELLE DES INVITÉS
-- ====================================================================

CREATE TABLE event_invite_user (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'guest', -- 'guest', 'co_admin'
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  last_active_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_event_user UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_invite_user_event_id ON event_invite_user(event_id);
CREATE INDEX idx_event_invite_user_user_id ON event_invite_user(user_id);

-- Activation de Row Level Security (RLS)
ALTER TABLE event_invite_user ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (RLS)
-- Tout le monde peut insérer sa propre participation (pour les invités/shadow login)
CREATE POLICY "Anyone can join an event"
ON event_invite_user FOR INSERT WITH CHECK (true);

-- Tout le monde peut lire la liste des invités d'un événement (nécessaire pour la vue de l'organisateur et la résolution des pseudos)
CREATE POLICY "Event guest lists are viewable by everyone"
ON event_invite_user FOR SELECT USING (true);

-- Autoriser la mise à jour (pour promouvoir en co-admin ou mettre à jour la date de dernière activité)
CREATE POLICY "Event guest links are updatable"
ON event_invite_user FOR UPDATE USING (true);

-- Purge du cache PostgREST
NOTIFY pgrst, 'reload schema';
