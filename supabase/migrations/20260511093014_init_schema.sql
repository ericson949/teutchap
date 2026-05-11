-- Table users (organisateurs)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  name          TEXT,
  plan          TEXT DEFAULT 'free',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Table events
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token           TEXT UNIQUE NOT NULL,    
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  event_type      TEXT NOT NULL,           
  event_date      DATE NOT NULL,
  mode            TEXT DEFAULT 'public',  
  reveal_at       TIMESTAMPTZ,            
  cover_url       TEXT,
  welcome_message TEXT,
  welcome_audio_url TEXT,
  branding_logo_url TEXT,
  status          TEXT DEFAULT 'active',  
  plan            TEXT DEFAULT 'free',
  photo_count     INT DEFAULT 0,
  storage_bytes   BIGINT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_token ON events(token);
CREATE INDEX idx_events_user_id ON events(user_id);

-- Table photos
CREATE TABLE photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID REFERENCES events(id) ON DELETE CASCADE,
  url_original    TEXT NOT NULL,          
  url_thumb       TEXT NOT NULL,          
  url_medium      TEXT,                   
  file_size_bytes INT,
  width           INT,
  height          INT,
  device_fingerprint TEXT,                
  uploader_name   TEXT,                   
  quality_score   FLOAT,                  
  is_blurry       BOOLEAN DEFAULT FALSE,  
  is_hidden       BOOLEAN DEFAULT FALSE,  
  challenge_id    UUID,                   
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photos_event_id ON photos(event_id);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Simple policies for MVP
-- Everyone can read public events
CREATE POLICY "Public events are viewable by everyone." 
ON events FOR SELECT USING (mode = 'public' OR status = 'active');

-- Anyone can insert photos to an active event (device_fingerprint acts as anonymous id)
CREATE POLICY "Anyone can upload photos"
ON photos FOR INSERT WITH CHECK (true);

-- Anyone can read non-hidden photos of public events
CREATE POLICY "Public photos viewable by everyone"
ON photos FOR SELECT USING (is_hidden = false);
