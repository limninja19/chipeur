-- Ajout du champ plan sur la table profiles
-- Plans disponibles : 'découverte' | 'mixe' | 'premium'
-- Par défaut : 'premium' (pendant la phase de test, tout le monde a accès à tout)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'premium'
  CHECK (plan IN ('découverte', 'mixe', 'premium'));

-- Index pour filtrer par plan côté Supabase si nécessaire
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);

-- Mise à jour des profils existants (pas de plan renseigné → premium)
UPDATE profiles SET plan = 'premium' WHERE plan IS NULL OR plan = '';
