-- ====================================================================
-- CRÉATION DES TABLES MANQUANTES : REACTIONS ET CHALLENGES
-- + CONFIGURATION COMPLÈTE DU MOTEUR SUPABASE REALTIME
-- ====================================================================

-- 1. Table reactions
CREATE TABLE IF NOT EXISTS reactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id            UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  emoji               TEXT NOT NULL,
  device_fingerprint  TEXT NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_photo_emoji_device UNIQUE (photo_id, emoji, device_fingerprint)
);

CREATE INDEX idx_reactions_photo_id ON reactions(photo_id);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions are viewable by everyone"
ON reactions FOR SELECT USING (true);

CREATE POLICY "Anyone can add reactions"
ON reactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their own reactions"
ON reactions FOR UPDATE USING (true);


-- 2. Table challenges
CREATE TABLE IF NOT EXISTS challenges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_challenges_event_id ON challenges(event_id);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are viewable by everyone"
ON challenges FOR SELECT USING (true);

CREATE POLICY "Anyone can add challenges"
ON challenges FOR INSERT WITH CHECK (true);


-- 3. Inscription exhaustive dans la publication Realtime
-- Cela garantit le déclenchement immédiat de tous les callbacks frontend on('postgres_changes')
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE photos;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE challenges;

-- Purge du cache PostgREST
NOTIFY pgrst, 'reload schema';
