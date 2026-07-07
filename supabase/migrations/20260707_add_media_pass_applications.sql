-- Media Pass applications. Submitted from public /media form, reviewed
-- offline by team@nft.nyc. Field names deliberately mirror the historical
-- HubSpot Contact property names so a future HubSpot re-connect is trivial.

CREATE TABLE IF NOT EXISTS media_pass_applications (
  id                                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contact
  email                                         TEXT NOT NULL,
  firstname                                     TEXT NOT NULL,
  lastname                                      TEXT NOT NULL,
  jobtitle                                      TEXT,
  phone                                         TEXT NOT NULL,

  -- Organization
  company                                       TEXT NOT NULL,
  website                                       TEXT NOT NULL,
  company_twitter_handle                        TEXT NOT NULL,
  company_logo_path                             TEXT,   -- storage key in media-pass-logos
  company_community_size                        INTEGER NOT NULL,
  company_recent_update                         TEXT NOT NULL,
  share_a_link_to_recent_nft_related_coverage   TEXT NOT NULL,
  how_to_cover_nft_nyc_2023_and_publish_location TEXT NOT NULL,   -- 2023 in name is intentional
  media_organization_type                       TEXT NOT NULL
                                                CHECK (media_organization_type IN ('blog','documentary','podcast','news','youtube')),
  nft_nyc_media_passes_requested                INTEGER NOT NULL
                                                CHECK (nft_nyc_media_passes_requested IN (1,2)),
  commitment_to_credit_nft_nyc                  BOOLEAN NOT NULL,

  -- Review state
  status                                        TEXT NOT NULL DEFAULT 'pending'
                                                CHECK (status IN ('pending','approved','declined')),
  reviewed_at                                   TIMESTAMPTZ,
  reviewed_by                                   TEXT,
  notes                                         TEXT
);

CREATE INDEX IF NOT EXISTS media_pass_applications_status_created_idx
  ON media_pass_applications (status, created_at DESC);

ALTER TABLE media_pass_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'media_pass_applications_admin_all' AND tablename = 'media_pass_applications') THEN
    CREATE POLICY media_pass_applications_admin_all ON media_pass_applications
      FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Private bucket for uploaded logos.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media-pass-logos', 'media-pass-logos', false, 5242880,
        ARRAY['image/png','image/jpeg','image/svg+xml','image/webp'])
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'media_pass_logos_admin_select' AND tablename = 'objects') THEN
    CREATE POLICY media_pass_logos_admin_select ON storage.objects
      FOR SELECT TO authenticated USING (bucket_id = 'media-pass-logos');
  END IF;
END $$;
