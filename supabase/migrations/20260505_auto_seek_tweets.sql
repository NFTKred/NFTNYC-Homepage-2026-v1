-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Auto-Seek Tweets feature (additive-only)
--
-- Every statement here is purely additive: new column, new table, new
-- indexes, new trigger, new RLS policies. No DROPs, no UPDATEs, no schema
-- mutations on existing data. Safe to paste into the Supabase SQL editor.
--
-- Two follow-up scripts are available for OPTIONAL non-additive work:
--   • supabase-migration-verticals.sql    — re-applies the 12-vertical CHECK
--                                            constraint (rwa/domains/desci).
--   • supabase-disable-qrt-for-regulatory.sql (separate file, not required)
--                                            — heuristic UPDATE to disable
--                                              qrt_eligible for regulators.
--
-- Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ───────────────────────────────────────────────────────────────────────────
-- 1. qrt_eligible column on speakers (default TRUE).
--    Additive: existing rows simply get the default value.
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE speakers
  ADD COLUMN IF NOT EXISTS qrt_eligible BOOLEAN NOT NULL DEFAULT TRUE;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. speaker_tweets — candidate tweet storage for QRT outreach.
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

-- CREATE TRIGGER lacks an "IF NOT EXISTS" form, so we guard with a DO block
-- to keep this idempotent without flagging as destructive.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'speaker_tweets_updated_at'
  ) THEN
    CREATE TRIGGER speaker_tweets_updated_at
      BEFORE UPDATE ON speaker_tweets
      FOR EACH ROW EXECUTE FUNCTION speaker_tweets_set_updated_at();
  END IF;
END $$;

-- ───────────────────────────────────────────────────────────────────────────
-- 3. Indexes.
-- ───────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS speaker_tweets_speaker_status_idx
  ON speaker_tweets (speaker_id, qrt_status);

CREATE INDEX IF NOT EXISTS speaker_tweets_speaker_posted_idx
  ON speaker_tweets (speaker_id, posted_at DESC);

-- ───────────────────────────────────────────────────────────────────────────
-- 4. RLS — public read approved candidates only, admins full access.
--    Mirrors the resources policy pattern. CREATE POLICY also lacks an
--    "IF NOT EXISTS" form, so we guard each with a DO block.
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE speaker_tweets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'speaker_tweets_public_select_approved' AND tablename = 'speaker_tweets') THEN
    CREATE POLICY speaker_tweets_public_select_approved ON speaker_tweets
      FOR SELECT USING (qrt_status = 'approved');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'speaker_tweets_admin_select' AND tablename = 'speaker_tweets') THEN
    CREATE POLICY speaker_tweets_admin_select ON speaker_tweets
      FOR SELECT TO authenticated USING (is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'speaker_tweets_admin_insert' AND tablename = 'speaker_tweets') THEN
    CREATE POLICY speaker_tweets_admin_insert ON speaker_tweets
      FOR INSERT TO authenticated WITH CHECK (is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'speaker_tweets_admin_update' AND tablename = 'speaker_tweets') THEN
    CREATE POLICY speaker_tweets_admin_update ON speaker_tweets
      FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'speaker_tweets_admin_delete' AND tablename = 'speaker_tweets') THEN
    CREATE POLICY speaker_tweets_admin_delete ON speaker_tweets
      FOR DELETE TO authenticated USING (is_admin());
  END IF;
END $$;

COMMIT;
