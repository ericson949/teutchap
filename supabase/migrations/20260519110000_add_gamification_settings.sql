-- Phase 2 gamification controls.
-- adaptive: follows event type defaults, party: visible leaderboard/awards, sober: discreet mode, off: hidden.
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS gamification_mode TEXT DEFAULT 'adaptive',
  ADD COLUMN IF NOT EXISTS enable_leaderboard BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_awards BOOLEAN DEFAULT TRUE;

ALTER TABLE events
  ADD CONSTRAINT check_gamification_mode
  CHECK (gamification_mode IN ('adaptive', 'party', 'sober', 'off'));

NOTIFY pgrst, 'reload schema';
