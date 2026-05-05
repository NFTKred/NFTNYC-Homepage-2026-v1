-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Auto-Seek Tweets feature
--   1. Ensure CHECK constraint on vertical_id includes rwa/domains/desci
--      (idempotent — drop and re-add with the full 12-value list).
--   2. Add `qrt_eligible` boolean to speakers (default TRUE).
--   3. Auto-set `qrt_eligible = FALSE` for speakers in regulatory / government
--      roles (heuristic: outreach_channel = 'other' AND role matches
--      SEC/commissioner/regulator/congress/senator/representative).
--   4. Create `speaker_tweets` table for QRT-candidate tweet storage.
--   5. Indexes for the common lookups.
--   6. RLS: public can read approved tweets; admins have full access. Mirrors
--      the resources table policies.
--
-- Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Verticals — idempotently set the 12-value CHECK constraint.
--    (Top-level supabase-migration-verticals.sql may not have been applied
--    in every environment; this guarantees it.)
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_vertical_id_check;
ALTER TABLE speakers  DROP CONSTRAINT IF EXISTS speakers_vertical_id_check;

UPDATE resources SET vertical_id = 'culture' WHERE vertical_id = 'communities';
UPDATE speakers  SET vertical_id = 'culture' WHERE vertical_id = 'communities';

ALTER TABLE resources
  ADD CONSTRAINT resources_vertical_id_check
  CHECK (vertical_id IN (
    'ai','gaming','infra','social','creator','defi',
    'rwa','brands','culture','domains','desci','marketplaces'
  ));

ALTER TABLE speakers
  ADD CONSTRAINT speakers_vertical_id_check
  CHECK (vertical_id IN (
    'ai','gaming','infra','social','creator','defi',
    'rwa','brands','culture','domains','desci','marketplaces'
  ));

-- ───────────────────────────────────────────────────────────────────────────
-- 2. qrt_eligible column on speakers.
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE speakers
  ADD COLUMN IF NOT EXISTS qrt_eligible BOOLEAN NOT NULL DEFAULT TRUE;

-- ───────────────────────────────────────────────────────────────────────────
-- 3. Default-disable QRT for regulatory / government roles. Heuristic:
--    outreach_channel = 'other' (signal that it's a non-standard contact)
--    AND role contains an obvious public-office keyword.
--    Speakers can still be re-enabled in admin. Idempotent.
-- ───────────────────────────────────────────────────────────────────────────
UPDATE speakers
SET    qrt_eligible = FALSE
WHERE  outreach_channel = 'other'
  AND  role ~* '(SEC|commissioner|regulator|congress|senator|representative|governor|minister|attorney general)';

-- ───────────────────────────────────────────────────────────────────────────
-- 4. speaker_tweets — candidate tweet storage for QRT outreach.
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS speaker_tweets (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  speaker_id    UUID         NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
  tweet_url     TEXT         NOT NULL,
  tweet_id      TEXT,
  posted_at     TIMESTAMPTZ,
  text          TEXT         NOT NULL,
  media_type    TEXT         CHECK (media_type IN ('text','image','video','link','thread')),
  is_thread     BOOLEAN      NOT NULL DEFAULT FALSE,
  engagement    JSONB,                              -- { likes, reposts, replies, views, verified: bool }
  qrt_score     NUMERIC      NOT NULL DEFAULT 0,    -- 0–100
  qrt_reason    TEXT,                               -- short human-readable scoring rationale
  topic_match   TEXT,                               -- ecosystem vertical it best aligns with
  qrt_status    TEXT         NOT NULL DEFAULT 'candidate'
                CHECK (qrt_status IN ('candidate','approved','used','rejected')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (speaker_id, tweet_url)
);

-- Touch updated_at on row changes.
CREATE OR REPLACE FUNCTION speaker_tweets_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS speaker_tweets_updated_at ON speaker_tweets;
CREATE TRIGGER speaker_tweets_updated_at
  BEFORE UPDATE ON speaker_tweets
  FOR EACH ROW EXECUTE FUNCTION speaker_tweets_set_updated_at();

-- ───────────────────────────────────────────────────────────────────────────
-- 5. Indexes — the two hot lookups are
--    "all candidates for a speaker" and "newest first per speaker".
-- ───────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS speaker_tweets_speaker_status_idx
  ON speaker_tweets (speaker_id, qrt_status);

CREATE INDEX IF NOT EXISTS speaker_tweets_speaker_posted_idx
  ON speaker_tweets (speaker_id, posted_at DESC);

-- ───────────────────────────────────────────────────────────────────────────
-- 6. RLS — public read approved candidates only, admins full access.
--    Mirrors the resources policy pattern in supabase-schema.sql.
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE speaker_tweets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS speaker_tweets_public_select_approved ON speaker_tweets;
CREATE POLICY speaker_tweets_public_select_approved ON speaker_tweets
  FOR SELECT
  USING (qrt_status = 'approved');

DROP POLICY IF EXISTS speaker_tweets_admin_select ON speaker_tweets;
CREATE POLICY speaker_tweets_admin_select ON speaker_tweets
  FOR SELECT
  TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS speaker_tweets_admin_insert ON speaker_tweets;
CREATE POLICY speaker_tweets_admin_insert ON speaker_tweets
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS speaker_tweets_admin_update ON speaker_tweets;
CREATE POLICY speaker_tweets_admin_update ON speaker_tweets
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS speaker_tweets_admin_delete ON speaker_tweets;
CREATE POLICY speaker_tweets_admin_delete ON speaker_tweets
  FOR DELETE
  TO authenticated
  USING (is_admin());

COMMIT;
