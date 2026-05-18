-- Migration : ajout flyer_url sur la table sorties
-- Permet d'uploader l'affiche/flyer d'un événement

ALTER TABLE sorties ADD COLUMN IF NOT EXISTS flyer_url TEXT;
