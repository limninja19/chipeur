-- Migration : ajout de la colonne visibility sur la table posts
-- Valeurs possibles : 'public' (fil + vitrine) | 'vitrine' (vitrine seulement)
-- Défaut 'public' pour ne pas casser les posts existants

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public'
  CHECK (visibility IN ('public', 'vitrine'));

-- Index pour accélérer le filtre sur le fil
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts (visibility);
