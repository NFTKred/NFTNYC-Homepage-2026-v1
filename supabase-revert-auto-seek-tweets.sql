-- ═══════════════════════════════════════════════════════════════════════════
-- OPTIONAL revert script for the abandoned auto-seek-tweets feature.
--
-- Drops:
--   • speakers.qrt_eligible column (added 2026-05-05, never used by UI)
--   • speaker_tweets table + indexes + trigger + RLS policies
--
-- These are safe to drop — the feature was removed before any candidates
-- were ever inserted (every Auto-Seek Tweets click returned 0 candidates
-- because Perplexity / Gemini can't reach X reliably).
--
-- This script is NOT REQUIRED — leaving the column and empty table in
-- place is harmless. Run only if you want a clean schema.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Drop the table (CASCADE removes its indexes, trigger, and policies).
DROP TABLE IF EXISTS speaker_tweets CASCADE;

-- 2. Drop the trigger function (now orphaned).
DROP FUNCTION IF EXISTS speaker_tweets_set_updated_at();

-- 3. Drop the unused speakers column.
ALTER TABLE speakers DROP COLUMN IF EXISTS qrt_eligible;

COMMIT;
