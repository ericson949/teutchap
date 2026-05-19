CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les admins
CREATE POLICY "Les admins peuvent voir tous les paiements"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
  )
);

-- Politique d'insertion pour l'organisateur (basée sur le device id ou ouverte pour le MVP simulé)
CREATE POLICY "Insertion de paiement public pour MVP"
ON payments FOR INSERT
WITH CHECK (true);
