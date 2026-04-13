-- ═══════════════════════════════════════════════════════════════════════════
-- Add display_order to resources for drag-and-drop reordering in the Admin UI.
--
-- Ordering rule used everywhere resources are fetched:
--   ORDER BY display_order NULLS LAST, date DESC
--
-- New rows default to NULL → they appear by date as before. Once an admin
-- reorders a vertical, every row in that vertical gets a numeric
-- display_order so the order is stable across sessions and devices.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS display_order INTEGER;

CREATE INDEX IF NOT EXISTS resources_vertical_order_idx
  ON resources (vertical_id, display_order NULLS LAST, date DESC);
