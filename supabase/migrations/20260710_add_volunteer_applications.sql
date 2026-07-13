-- Volunteer applications for NFT.NYC 2026 (Sept 1-3).
--
-- Public /volunteer form uploads a photo ID and an intro video directly to
-- private Supabase Storage from the browser, then posts a JSON payload with
-- the two storage paths to submit-volunteer-application. That edge function
-- inserts a row here and emails team@nft.nyc with signed URLs.

CREATE TABLE IF NOT EXISTS volunteer_applications (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contact
  firstname                   TEXT NOT NULL,
  lastname                    TEXT NOT NULL,
  email                       TEXT NOT NULL,
  twitter_handle              TEXT,
  linkedin_url                TEXT,
  phone                       TEXT NOT NULL,

  -- Storage keys (paths within their respective private buckets).
  photo_id_path               TEXT NOT NULL,
  video_path                  TEXT NOT NULL,

  -- Consent checkboxes
  wants_to_volunteer          BOOLEAN NOT NULL,
  agree_conduct               BOOLEAN NOT NULL,
  understands_ticket_terms    BOOLEAN NOT NULL,

  -- Review state
  status                      TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','approved','declined')),
  reviewed_at                 TIMESTAMPTZ,
  reviewed_by                 TEXT,
  notes                       TEXT
);

CREATE INDEX IF NOT EXISTS volunteer_applications_status_created_idx
  ON volunteer_applications (status, created_at DESC);

ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_applications_admin_all' AND tablename = 'volunteer_applications') THEN
    CREATE POLICY volunteer_applications_admin_all ON volunteer_applications
      FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ─── Storage buckets ────────────────────────────────────────────────────────
-- Photo IDs bucket. 10 MB max, image-only. Sensitive PII — private, signed
-- URLs only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('volunteer-photo-ids', 'volunteer-photo-ids', false, 10485760,
        ARRAY['image/png','image/jpeg','image/webp','image/heic','image/heif','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Intro videos bucket. 100 MB max, common video MIME types.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('volunteer-videos', 'volunteer-videos', false, 104857600,
        ARRAY['video/mp4','video/quicktime','video/webm','video/x-m4v'])
ON CONFLICT (id) DO NOTHING;

-- Policies: anon can INSERT (public form is submitting), authenticated can
-- SELECT (admins reviewing). Anon CANNOT read anything back — sensitive PII.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_photo_ids_anon_insert' AND tablename = 'objects') THEN
    CREATE POLICY volunteer_photo_ids_anon_insert ON storage.objects
      FOR INSERT TO anon WITH CHECK (bucket_id = 'volunteer-photo-ids');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_photo_ids_admin_select' AND tablename = 'objects') THEN
    CREATE POLICY volunteer_photo_ids_admin_select ON storage.objects
      FOR SELECT TO authenticated USING (bucket_id = 'volunteer-photo-ids');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_videos_anon_insert' AND tablename = 'objects') THEN
    CREATE POLICY volunteer_videos_anon_insert ON storage.objects
      FOR INSERT TO anon WITH CHECK (bucket_id = 'volunteer-videos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_videos_admin_select' AND tablename = 'objects') THEN
    CREATE POLICY volunteer_videos_admin_select ON storage.objects
      FOR SELECT TO authenticated USING (bucket_id = 'volunteer-videos');
  END IF;
END $$;
