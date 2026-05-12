-- Création de la table de configuration des plans commerciaux
CREATE TABLE IF NOT EXISTS public.app_plans (
    name text PRIMARY KEY,
    max_guests int NOT NULL,
    max_photos int NOT NULL,
    max_photos_per_user int NOT NULL,
    allow_challenges boolean DEFAULT false,
    updated_at timestamptz DEFAULT now()
);

-- Activation de la sécurité RLS
ALTER TABLE public.app_plans ENABLE ROW LEVEL SECURITY;

-- Autorisation en lecture pour tout le monde (accès public/invité pour configuration UI)
CREATE POLICY "Lecture publique des configurations de plans" 
ON public.app_plans 
FOR SELECT 
USING (true);

-- Insertion des valeurs par défaut pour les 3 formules
INSERT INTO public.app_plans (name, max_guests, max_photos, max_photos_per_user, allow_challenges)
VALUES 
    ('free', 15, 100, 10, false),
    ('premium', 100, 1000, 30, true),
    ('vip', 500, 3000, 100, true)
ON CONFLICT (name) DO UPDATE 
SET 
    max_guests = EXCLUDED.max_guests,
    max_photos = EXCLUDED.max_photos,
    max_photos_per_user = EXCLUDED.max_photos_per_user,
    allow_challenges = EXCLUDED.allow_challenges,
    updated_at = now();
