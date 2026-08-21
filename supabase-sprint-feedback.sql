-- Sprint feedback survey (/sprintfeedback).
-- Run this manually in the Supabase SQL editor.
-- The public form posts to the submit-sprint-feedback edge function, which
-- inserts a row here with the service role and emails the answers to
-- contact@peoplebrowsr.com.

CREATE TABLE IF NOT EXISTS sprint_feedback (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sprint            TEXT NOT NULL DEFAULT 'sprint1',
  email             TEXT,
  overall_rating    SMALLINT,
  submitted_project TEXT,
  blockers          TEXT[],
  blockers_other    TEXT,
  kit_clarity       SMALLINT,
  kit_comments      TEXT,
  support_session   TEXT,
  api_rating        SMALLINT,
  api_friction      TEXT,
  example_apps      TEXT,
  next_sprint_nps   SMALLINT,
  user_agent        TEXT
);

CREATE INDEX IF NOT EXISTS sprint_feedback_created_idx
  ON sprint_feedback (created_at DESC);

ALTER TABLE sprint_feedback ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.sprint_feedback TO authenticated;
GRANT ALL ON public.sprint_feedback TO service_role;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sprint_feedback_admin_read' AND tablename = 'sprint_feedback') THEN
    CREATE POLICY sprint_feedback_admin_read ON public.sprint_feedback
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
