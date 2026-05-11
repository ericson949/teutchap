-- Add reveal_time column to events table to support Reveal Mode
ALTER TABLE events
ADD COLUMN reveal_time timestamp with time zone;
