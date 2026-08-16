-- Migration 026: Newsletter subscribers + contact messages
--
-- The footer newsletter form previously showed a success toast and DISCARDED
-- the email (no storage of any kind). The contact section offered only a
-- mailto link. Both now persist to the database.
--
-- Security model: anonymous visitors may INSERT only (write-only mailbox).
-- Reading/managing rows is limited to admins via their existing role check.

-- ────────────────────────────────────────────────────────────
-- 1. Newsletter subscribers
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  language TEXT NOT NULL DEFAULT 'bg' CHECK (language IN ('bg', 'en')),
  source TEXT NOT NULL DEFAULT 'footer',
  confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone may subscribe (insert only — anon can never read the list)
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view/manage subscribers
DROP POLICY IF EXISTS "Admins manage subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins manage subscribers"
  ON newsletter_subscribers FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role IN ('admin', 'superadmin')
  ));

-- ────────────────────────────────────────────────────────────
-- 2. Contact messages (website contact form)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  language TEXT NOT NULL DEFAULT 'bg',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  handled BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can send a message" ON contact_messages;
CREATE POLICY "Anyone can send a message"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage messages" ON contact_messages;
CREATE POLICY "Admins manage messages"
  ON contact_messages FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role IN ('admin', 'superadmin')
  ));

-- ────────────────────────────────────────────────────────────
-- 3. Membership applications (store BEFORE emailing — applications must
--    never be lost when the email provider fails)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_type TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  payload JSONB NOT NULL,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can apply" ON membership_applications;
CREATE POLICY "Anyone can apply"
  ON membership_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage applications" ON membership_applications;
CREATE POLICY "Admins manage applications"
  ON membership_applications FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role IN ('admin', 'superadmin')
  ));
