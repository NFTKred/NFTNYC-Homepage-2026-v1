-- ═══════════════════════════════════════════════════════════════════════════
-- Make sure cameronbale@peoplebrowsr.com is in the admin_users table.
-- The RLS policies on resources / speakers check membership of this table
-- via the is_admin() function. If your email isn't in it, DELETE/UPDATE
-- calls silently return zero rows (no error, but nothing happens).
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO admin_users (email)
VALUES
  ('cameronbale@peoplebrowsr.com')
ON CONFLICT (email) DO NOTHING;

-- Sanity check:
SELECT * FROM admin_users ORDER BY email;
