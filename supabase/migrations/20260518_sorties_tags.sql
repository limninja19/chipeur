-- Migration : ajout tags[] sur la table sorties
-- Permet les étiquettes multi-sélection sur les événements

ALTER TABLE sorties ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
