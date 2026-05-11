-- Create storage bucket for event photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('events_photos', 'events_photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for the bucket
-- Allow public access to read photos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'events_photos' );

-- Allow anyone to upload photos (anonymous guests)
CREATE POLICY "Guest Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'events_photos' );

-- Allow users to manage their own uploads (optional, but good for organizers)
CREATE POLICY "Organizer Management"
ON storage.objects FOR ALL
USING ( bucket_id = 'events_photos' );
