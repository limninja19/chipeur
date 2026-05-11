-- Ajouter la colonne link_url à la table posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS link_url TEXT;
