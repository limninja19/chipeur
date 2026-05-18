-- Migration : recherche produit (IA tags) + logs analytics
-- Table search_logs : enregistre chaque recherche (commerce ou produit)
-- RPC search_posts_by_tag : cherche les posts par tags IA (cross-merchant)

-- ── Table search_logs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  query         TEXT        NOT NULL,
  type          TEXT        NOT NULL DEFAULT 'commerce'
                CHECK (type IN ('commerce', 'produit')),
  results_count INT         NOT NULL DEFAULT 0,
  user_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  commerce_id   UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_logs_type       ON search_logs(type);
CREATE INDEX IF NOT EXISTS idx_search_logs_query      ON search_logs(query);
CREATE INDEX IF NOT EXISTS idx_search_logs_results    ON search_logs(results_count);
CREATE INDEX IF NOT EXISTS idx_search_logs_commerce   ON search_logs(commerce_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at DESC);

ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_logs_insert_all"
  ON search_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "search_logs_select_owner"
  ON search_logs FOR SELECT
  USING (
    commerce_id IS NOT NULL
    AND commerce_id = auth.uid()
  );

-- ── RPC search_posts_by_tag ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_posts_by_tag(query TEXT)
RETURNS TABLE (
  post_id      UUID,
  image_url    TEXT,
  tags         TEXT[],
  commerce_id  UUID,
  commerce_nom TEXT,
  commerce_cat TEXT,
  matched_tag  TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id         AS post_id,
    p.image_url,
    p.tags,
    pr.id        AS commerce_id,
    pr.pseudo    AS commerce_nom,
    pr.categorie AS commerce_cat,
    (
      SELECT t FROM unnest(p.tags) AS t
      WHERE t ILIKE '%' || query || '%'
      LIMIT 1
    )            AS matched_tag
  FROM posts p
  JOIN profiles pr ON pr.id = p.author_id
  WHERE
    p.tags IS NOT NULL
    AND array_length(p.tags, 1) > 0
    AND (p.linked_status IS NULL OR p.linked_status = 'accepted')
    AND EXISTS (
      SELECT 1 FROM unnest(p.tags) AS t
      WHERE t ILIKE '%' || query || '%'
    )
  ORDER BY p.created_at DESC
  LIMIT 40;
$$;

GRANT EXECUTE ON FUNCTION search_posts_by_tag(TEXT) TO anon, authenticated;
