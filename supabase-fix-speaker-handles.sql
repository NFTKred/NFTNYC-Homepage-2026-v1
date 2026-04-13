-- ═══════════════════════════════════════════════════════════════════════════
-- One-off cleanup: strip leading '@' from speaker handles.
--
-- The Admin UI prefixes '@' at display time (Admin.tsx line 400), so stored
-- values should not include it. The initial target-speaker seed wrote the
-- raw '@handle', causing double-@@ in the UI.
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE speakers
SET    handle = ltrim(handle, '@')
WHERE  handle LIKE '@%';

-- Verify:
-- SELECT name, handle FROM speakers WHERE handle LIKE '@%';  -- should return 0 rows
