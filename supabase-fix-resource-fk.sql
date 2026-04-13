-- ═══════════════════════════════════════════════════════════════════════════
-- Fix: speakers.related_resource_id FK must be ON DELETE SET NULL.
--
-- The existing constraint was created without ON DELETE SET NULL, which
-- blocks deletion of any resource that a speaker references. We re-create
-- it with the correct behaviour: deleting a resource simply clears the
-- speaker's link instead of aborting the delete.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE speakers
  DROP CONSTRAINT IF EXISTS speakers_related_resource_id_fkey;

ALTER TABLE speakers
  ADD CONSTRAINT speakers_related_resource_id_fkey
  FOREIGN KEY (related_resource_id)
  REFERENCES resources(id)
  ON DELETE SET NULL;

-- Verify:
-- SELECT conname, confdeltype
-- FROM   pg_constraint
-- WHERE  conname = 'speakers_related_resource_id_fkey';
-- confdeltype 'n' means SET NULL — that's what we want.
