-- VibeSprint registrations: registrant contact details required by the
-- api.domains.kred registrar, plus the outcome of the .kred registration.

ALTER TABLE public.vibesprint_registrations
  ADD COLUMN IF NOT EXISTS phone               TEXT,
  ADD COLUMN IF NOT EXISTS address1            TEXT,
  ADD COLUMN IF NOT EXISTS city                TEXT,
  ADD COLUMN IF NOT EXISTS state               TEXT,
  ADD COLUMN IF NOT EXISTS postal_code         TEXT,
  ADD COLUMN IF NOT EXISTS country             TEXT,
  ADD COLUMN IF NOT EXISTS profile_link        TEXT,
  ADD COLUMN IF NOT EXISTS registration_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS registration_error  TEXT,
  ADD COLUMN IF NOT EXISTS registered_at       TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS vibesprint_registrations_status_idx
  ON public.vibesprint_registrations (registration_status);
