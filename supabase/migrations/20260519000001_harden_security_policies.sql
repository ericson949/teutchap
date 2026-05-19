-- Durcissement de la sécurité pour les photos
DROP POLICY IF EXISTS "Anyone can delete photos" ON photos;

CREATE POLICY "Creator device or admin can delete photos"
ON photos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = photos.event_id 
    AND (
      events.creator_device_id = current_setting('request.headers', true)::json->>'x-device-id' 
      OR (SELECT is_admin FROM users WHERE id = auth.uid()) = true
    )
  )
);

-- Durcissement de la sécurité pour les réactions
DROP POLICY IF EXISTS "Anyone can delete reactions" ON reactions;

CREATE POLICY "Creator device or admin can delete reactions"
ON reactions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = reactions.event_id 
    AND (
      events.creator_device_id = current_setting('request.headers', true)::json->>'x-device-id' 
      OR (SELECT is_admin FROM users WHERE id = auth.uid()) = true
    )
  )
);
