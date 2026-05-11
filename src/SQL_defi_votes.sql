-- ─── TABLE DEFI_VOTES ───
-- À coller et exécuter dans Supabase > SQL Editor

CREATE TABLE IF NOT EXISTS defi_votes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  defi_id    UUID NOT NULL REFERENCES defis(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  voter_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote       TEXT NOT NULL CHECK (vote IN ('like', 'pass')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un utilisateur ne peut voter qu'une seule fois par photo
  UNIQUE (post_id, voter_id)
);

-- Index pour accélérer les requêtes par défi + votant
CREATE INDEX IF NOT EXISTS idx_defi_votes_defi_voter ON defi_votes(defi_id, voter_id);

-- RLS : activé
ALTER TABLE defi_votes ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire (pour afficher les scores)
CREATE POLICY "defi_votes_select" ON defi_votes
  FOR SELECT USING (true);

-- Seul le votant peut insérer/modifier son propre vote
CREATE POLICY "defi_votes_insert" ON defi_votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "defi_votes_update" ON defi_votes
  FOR UPDATE USING (auth.uid() = voter_id);
