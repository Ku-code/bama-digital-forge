-- Migration 027: Public read access to the terminology dictionary
--
-- The bilingual AM terminology dictionary is BAMAS's strongest citable asset,
-- but it was visible only to logged-in members — invisible to search engines,
-- AI assistants and prospective members. This opens READ-ONLY access to
-- anonymous visitors for terms whose translation_status is 'Approved'.
-- All write paths remain admin-only; drafts stay members-only.

DROP POLICY IF EXISTS "Public can read approved terms" ON terminology_terms;
CREATE POLICY "Public can read approved terms"
  ON terminology_terms FOR SELECT
  TO anon
  USING (translation_status = 'Approved');
