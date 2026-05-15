-- Add creator_device_id to events to allow device-indexed security
ALTER TABLE events ADD COLUMN creator_device_id UUID;

-- Index for performance
CREATE INDEX idx_events_creator_device_id ON events(creator_device_id);

-- Update RLS policies to restrict access to organizer views
-- Currently anyone can SELECT if it's public/active. We keep that for Guest view.
-- But we want to ensure only the creator can UPDATE or view sensitive details if we add them.

CREATE POLICY "Only creator device can update event"
ON events FOR UPDATE
USING (creator_device_id::text = (select current_setting('request.headers')::json->>'x-device-id'))
WITH CHECK (creator_device_id::text = (select current_setting('request.headers')::json->>'x-device-id'));
