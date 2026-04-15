-- Allow "drafted" as a valid outreach_status on the speakers table.
-- Existing constraint only permitted not_started | contacted | responded | confirmed | declined.
ALTER TABLE speakers DROP CONSTRAINT IF EXISTS speakers_outreach_status_check;
ALTER TABLE speakers ADD CONSTRAINT speakers_outreach_status_check
  CHECK (outreach_status IN ('not_started', 'drafted', 'contacted', 'responded', 'confirmed', 'declined'));
