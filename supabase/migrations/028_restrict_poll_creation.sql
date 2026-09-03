-- 028: Restrict creation of official association polls to admins/superadmins.
--
-- Migration 001 allowed ANY authenticated user to insert into `polls` — the
-- check was only `auth.uid() = created_by`, which proves who you are, not that
-- you are entitled to call a vote. For an association whose polls carry
-- governance weight this is a privilege-escalation hole: an ordinary member
-- could open a binding vote.
--
-- `poll_options` needs no change: migration 006 already restricts option inserts
-- to polls the caller created, so it inherits this rule transitively.
--
-- The frontend (VotesContent.tsx) hides the button for non-admins, but that is
-- cosmetic; this policy is the actual gate.

BEGIN;

DROP POLICY IF EXISTS "Authenticated users can create polls" ON polls;
DROP POLICY IF EXISTS "Admins can create polls" ON polls;

CREATE POLICY "Admins can create polls"
  ON polls FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = created_by::text
    AND EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'superadmin')
        AND u.status = 'approved'
    )
  );

COMMIT;
