-- VibeSprint (/vibesprint) registrations.
-- Public form posts to submit-vibesprint-registration, which inserts a row
-- here (service role) and emails contact@peoplebrowsr.com with the details.

CREATE TABLE IF NOT EXISTS vibesprint_registrations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  segment      TEXT NOT NULL,
  domain       TEXT NOT NULL,
  build_tool   TEXT NOT NULL DEFAULT 'Lovable',
  agreed_tos   BOOLEAN NOT NULL DEFAULT TRUE,
  user_agent   TEXT,
  notes        TEXT
);

CREATE INDEX IF NOT EXISTS vibesprint_registrations_created_idx
  ON vibesprint_registrations (created_at DESC);

ALTER TABLE vibesprint_registrations ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.vibesprint_registrations TO authenticated;
GRANT ALL ON public.vibesprint_registrations TO service_role;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vibesprint_registrations_admin_read' AND tablename = 'vibesprint_registrations') THEN
    CREATE POLICY vibesprint_registrations_admin_read ON public.vibesprint_registrations
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
