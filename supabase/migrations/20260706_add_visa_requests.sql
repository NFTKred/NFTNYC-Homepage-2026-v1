-- Visa support letter requests. Submitted by public /visa form, reviewed
-- and approved by admins, delivered as PDF via email + Storage URL.

CREATE TABLE IF NOT EXISTS visa_requests (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  full_name                 TEXT NOT NULL,
  passport_number           TEXT NOT NULL,
  passport_issuing_country  TEXT NOT NULL,
  date_of_birth             DATE NOT NULL,
  nationality               TEXT NOT NULL,
  job_title                 TEXT NOT NULL,
  email                     TEXT NOT NULL,
  phone                     TEXT NOT NULL,
  ticket_order_number       TEXT,
  notes                     TEXT,

  status                    TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','approved','rejected')),
  reviewed_at               TIMESTAMPTZ,
  reviewed_by               TEXT,
  reject_reason             TEXT,
  letter_path               TEXT,
  letter_sent_at            TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS visa_requests_status_created_idx
  ON visa_requests (status, created_at DESC);

-- Locked down: only admins read/write via authenticated Supabase session.
-- Public form submits through the edge function (service role).
ALTER TABLE visa_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'visa_requests_admin_all' AND tablename = 'visa_requests') THEN
    CREATE POLICY visa_requests_admin_all ON visa_requests
      FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Private bucket for internal assets (Cameron's signature, letterhead).
-- Read via edge function using service role only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('internal-assets', 'internal-assets', false, 5242880,
        ARRAY['image/png','image/jpeg','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Private bucket for generated visa letters. Signed URLs only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('visa-letters', 'visa-letters', false, 10485760,
        ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'internal_assets_admin_select' AND tablename = 'objects') THEN
    CREATE POLICY internal_assets_admin_select ON storage.objects
      FOR SELECT TO authenticated USING (bucket_id = 'internal-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'internal_assets_admin_insert' AND tablename = 'objects') THEN
    CREATE POLICY internal_assets_admin_insert ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'internal-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'visa_letters_admin_select' AND tablename = 'objects') THEN
    CREATE POLICY visa_letters_admin_select ON storage.objects
      FOR SELECT TO authenticated USING (bucket_id = 'visa-letters');
  END IF;
END $$;
