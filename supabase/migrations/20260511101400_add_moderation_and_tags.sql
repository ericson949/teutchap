-- Phase 3: Intelligence & Automation
-- Adding columns for moderation and AI analysis

ALTER TABLE photos 
ADD COLUMN is_moderated BOOLEAN DEFAULT FALSE,
ADD COLUMN is_flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN ai_tags JSONB DEFAULT '[]',
ADD COLUMN moderation_score FLOAT;

-- Add a setting to events to enable/disable auto-moderation and AI features
ALTER TABLE events
ADD COLUMN auto_moderation BOOLEAN DEFAULT FALSE,
ADD COLUMN ai_tagging_enabled BOOLEAN DEFAULT FALSE;
