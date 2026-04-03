-- Fix speakers RLS: INSERT requires WITH CHECK, not just USING
-- Drop the existing ALL policy and replace with explicit per-operation policies

DROP POLICY IF EXISTS "Admins full access speakers" ON speakers;

-- SELECT (already covered by public read, but admins need to see all)
CREATE POLICY "Admins select speakers" ON speakers
  FOR SELECT TO authenticated
  USING (is_admin());

-- INSERT
CREATE POLICY "Admins insert speakers" ON speakers
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- UPDATE
CREATE POLICY "Admins update speakers" ON speakers
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- DELETE
CREATE POLICY "Admins delete speakers" ON speakers
  FOR DELETE TO authenticated
  USING (is_admin());

-- Also fix resources table which has the same pattern
DROP POLICY IF EXISTS "Admins full access resources" ON resources;

CREATE POLICY "Admins select resources" ON resources
  FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins insert resources" ON resources
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins update resources" ON resources
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins delete resources" ON resources
  FOR DELETE TO authenticated
  USING (is_admin());
