-- Sprint 1 close-out submissions (/sprint1).
-- Public form posts to submit-sprint-submission, which upserts a row here
-- (service role) and emails contact@peoplebrowsr.com with the details.
-- Builders may edit/resubmit before close: latest submission per email+sprint wins.

CREATE TABLE IF NOT EXISTS sprint_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sprint       TEXT NOT NULL DEFAULT 'sprint1',
  email        TEXT NOT NULL,
  app_url      TEXT NOT NULL,
  project_url  TEXT NOT NULL,
  team_members TEXT,
  user_agent   TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS sprint_submissions_email_sprint_idx
  ON sprint_submissions (lower(email), sprint);

CREATE INDEX IF NOT EXISTS sprint_submissions_created_idx
  ON sprint_submissions (created_at DESC);

ALTER TABLE sprint_submissions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.sprint_submissions TO authenticated;
GRANT ALL ON public.sprint_submissions TO service_role;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'sprint_submissions_admin_read' AND tablename = 'sprint_submissions') THEN
    CREATE POLICY sprint_submissions_admin_read ON public.sprint_submissions
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
