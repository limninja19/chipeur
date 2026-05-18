-- Ajout de la colonne vitrine_filtres sur profiles
-- Tableau de texte : filtres personnalisés visibles dans la vitrine du commerçant
-- Ex : ["Robes", "Pulls", "Accessoires", "Soldes"]

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS vitrine_filtres TEXT[] DEFAULT '{}';

-- Index GIN pour recherche rapide dans les tableaux (optionnel)
CREATE INDEX IF NOT EXISTS idx_profiles_vitrine_filtres ON profiles USING GIN(vitrine_filtres);
