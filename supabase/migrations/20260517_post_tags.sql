-- Migration : colonne tags TEXT[] sur posts
-- Utilisée pour les mots-clés extraits par l'IA (Claude Vision) depuis les photos

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Index GIN pour recherche rapide sur les tags
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (tags);
