-- ═══════════════════════════════════════════════════════════════
-- Migration: Update ecosystem verticals
-- - Add 3 new verticals: rwa, domains, desci
-- - Merge `communities` rows into `culture`
-- - (No structural rename needed — IDs ai, gaming, infra, social,
--   creator, defi, brands, culture, marketplaces remain the same;
--   only their display names changed in code)
-- ═══════════════════════════════════════════════════════════════

-- 1. Drop the existing CHECK constraints that limit vertical_id values
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_vertical_id_check;
ALTER TABLE speakers  DROP CONSTRAINT IF EXISTS speakers_vertical_id_check;

-- 2. Migrate any existing `communities` rows to `culture` (merge)
UPDATE resources SET vertical_id = 'culture' WHERE vertical_id = 'communities';
UPDATE speakers  SET vertical_id = 'culture' WHERE vertical_id = 'communities';

-- 3. Re-add the CHECK constraints with the new set of vertical_ids
ALTER TABLE resources
  ADD CONSTRAINT resources_vertical_id_check
  CHECK (vertical_id IN (
    'ai','gaming','infra','social','creator','defi',
    'rwa','brands','culture','domains','desci','marketplaces'
  ));

ALTER TABLE speakers
  ADD CONSTRAINT speakers_vertical_id_check
  CHECK (vertical_id IN (
    'ai','gaming','infra','social','creator','defi',
    'rwa','brands','culture','domains','desci','marketplaces'
  ));

-- Done. Existing data is preserved; new verticals (rwa, domains, desci)
-- can now be selected in the admin dashboard.
