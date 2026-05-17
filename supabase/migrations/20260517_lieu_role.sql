-- Migration : ajout du rôle "lieu" pour les établissements publics et culturels
-- (médiathèque, musée, piscine, théâtre, cinéma, salle des fêtes...)

-- Le champ "role" existe déjà dans la table profiles.
-- On s'assure juste que les nouvelles valeurs sont acceptées
-- (si tu as une contrainte CHECK sur role, ajoute 'lieu' ici).

-- Exemple si contrainte CHECK :
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
-- ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
--   CHECK (role IN ('voisin', 'magasin', 'lieu'));

-- Sinon, rien à faire côté schéma : le champ TEXT accepte déjà 'lieu'.

-- Index pour accélérer le filtre sur les lieux
CREATE INDEX IF NOT EXISTS idx_profiles_role_lieu ON profiles (role) WHERE role = 'lieu';

-- Colonne optionnelle lieu_type pour préciser le type d'établissement
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS lieu_type TEXT;
-- Exemples : 'mediatheque', 'musee', 'piscine', 'theatre', 'cinema', 'mairie', 'ecole', 'autre'
