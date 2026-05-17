-- ─────────────────────────────────────────────────────────────────────────────
-- Migration : Google Places — colonnes ajoutées à la table profiles
-- Date : 2026-05-17
-- ─────────────────────────────────────────────────────────────────────────────

-- Identifiant Google unique du lieu (null si saisie manuelle)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS google_place_id        text        UNIQUE,
  ADD COLUMN IF NOT EXISTS google_synced_at       timestamptz,
  ADD COLUMN IF NOT EXISTS google_data            jsonb,       -- payload brut Places API (audit)
  ADD COLUMN IF NOT EXISTS phone                  text,
  ADD COLUMN IF NOT EXISTS website                text,
  ADD COLUMN IF NOT EXISTS lat                    double precision,
  ADD COLUMN IF NOT EXISTS lng                    double precision,
  ADD COLUMN IF NOT EXISTS opening_hours          jsonb,       -- horaires hebdo standards
  ADD COLUMN IF NOT EXISTS current_opening_hours  jsonb,       -- horaires temps réel (jours fériés inclus)
  ADD COLUMN IF NOT EXISTS photo_urls             text[];      -- URLs Supabase Storage (pas Google)

-- Index pour le cron places-refresh-hours (ne traite que les commerçants avec fiche Google)
CREATE INDEX IF NOT EXISTS idx_profiles_google_place_id
  ON profiles (google_place_id)
  WHERE google_place_id IS NOT NULL;

-- ─── Bucket Supabase Storage pour les photos commerçants ────────────────────
-- À exécuter manuellement dans le dashboard Supabase > Storage > New bucket
-- Nom du bucket : merchant-photos
-- Accès : public (les photos sont affichées publiquement sur les fiches)
-- Taille max fichier : 5 MB
-- Types autorisés : image/jpeg, image/png, image/webp
--
-- OU via SQL (si extension storage activée) :
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('merchant-photos', 'merchant-photos', true)
-- ON CONFLICT (id) DO NOTHING;
