-- 029: Real backend for the Budget panel.
--
-- BudgetContent.tsx held its accounts, transactions and budget lines in
-- `useState` seeded from MOCK_* constants, so anything the treasurer entered
-- disappeared on refresh. These tables give it real storage.
--
-- Distinct from `billing_history` (migration 019), which tracks per-member dues.
-- This is association-level treasury: what is in the accounts and where it went.
--
-- Access is board-level: superadmin, admin and board_member. Ordinary members
-- never see the Budget panel (Dashboard.tsx hides it) and RLS enforces that.

BEGIN;

-- ── Helper ────────────────────────────────────────────────────────────────
-- Board-level access check, reused by every policy below.
CREATE OR REPLACE FUNCTION public.is_board_level()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('superadmin', 'admin', 'board_member')
      AND u.status = 'approved'
  );
$$;

-- ── Bank accounts ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bank_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  bank_name       TEXT NOT NULL,
  iban            TEXT NOT NULL,
  currency        VARCHAR(3) NOT NULL DEFAULT 'BGN'
                    CHECK (currency IN ('BGN', 'EUR')),
  -- Balance is derived: opening_balance + the account's transactions.
  -- Storing a mutable "balance" invites drift against the ledger.
  opening_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  type            TEXT NOT NULL DEFAULT 'checking'
                    CHECK (type IN ('checking', 'savings', 'grant')),
  is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Transactions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS treasury_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  txn_date    DATE NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('income', 'expense')),
  subcategory TEXT NOT NULL,
  -- Always stored positive; `category` carries the sign.
  amount      NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  currency    VARCHAR(3) NOT NULL DEFAULT 'BGN'
                CHECK (currency IN ('BGN', 'EUR')),
  account_id  UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  reference   TEXT,
  notes       TEXT,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treasury_txn_date    ON treasury_transactions(txn_date DESC);
CREATE INDEX IF NOT EXISTS idx_treasury_txn_account ON treasury_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_treasury_txn_cat     ON treasury_transactions(category, subcategory);

-- ── Budget lines ──────────────────────────────────────────────────────────
-- Only the *planned* figure is stored; "actual" is summed from transactions
-- so the two can never disagree.
CREATE TABLE IF NOT EXISTS budget_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  budgeted    NUMERIC(14,2) NOT NULL DEFAULT 0,
  color       TEXT NOT NULL DEFAULT '#10B981',
  fiscal_year INT NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, fiscal_year)
);

-- ── Derived balances ──────────────────────────────────────────────────────
CREATE OR REPLACE VIEW bank_account_balances
WITH (security_invoker = true) AS
SELECT
  a.*,
  a.opening_balance
    + COALESCE(SUM(CASE WHEN t.category = 'income'  THEN t.amount ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN t.category = 'expense' THEN t.amount ELSE 0 END), 0)
    AS balance
FROM bank_accounts a
LEFT JOIN treasury_transactions t ON t.account_id = a.id
GROUP BY a.id;

-- ── RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE bank_accounts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories     ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['bank_accounts', 'treasury_transactions', 'budget_categories']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Board can read %1$s" ON %1$I', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Board can write %1$s" ON %1$I', tbl);
    EXECUTE format(
      'CREATE POLICY "Board can read %1$s" ON %1$I FOR SELECT TO authenticated USING (public.is_board_level())', tbl);
    EXECUTE format(
      'CREATE POLICY "Board can write %1$s" ON %1$I FOR ALL TO authenticated USING (public.is_board_level()) WITH CHECK (public.is_board_level())', tbl);
  END LOOP;
END $$;

-- ── updated_at triggers ───────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_bank_accounts_updated  ON bank_accounts;
DROP TRIGGER IF EXISTS trg_treasury_txn_updated   ON treasury_transactions;
DROP TRIGGER IF EXISTS trg_budget_cat_updated     ON budget_categories;

CREATE TRIGGER trg_bank_accounts_updated BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_treasury_txn_updated BEFORE UPDATE ON treasury_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_budget_cat_updated BEFORE UPDATE ON budget_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Seed ──────────────────────────────────────────────────────────────────
-- The two real association accounts, carried over from the MOCK_ACCOUNTS
-- constants. `name` stays a translation key so the UI keeps rendering it
-- bilingually. Idempotent on IBAN.
INSERT INTO bank_accounts (name, bank_name, iban, currency, type, is_primary, sort_order)
VALUES
  ('dashboard.budget.bankDetails.account1Name', 'EUROBANK BULGARIA AD', 'BG55BPBI79421200077761', 'BGN', 'checking', TRUE,  0),
  ('dashboard.budget.bankDetails.account2Name', 'Paysera LT, UAB',      'LT443500010018837611',   'EUR', 'grant',    FALSE, 1)
ON CONFLICT DO NOTHING;

INSERT INTO budget_categories (name, type, color, sort_order)
VALUES
  ('dashboard.budget.category.membershipFees', 'income',  '#10B981', 0),
  ('dashboard.budget.category.grants',         'income',  '#3B82F6', 1),
  ('dashboard.budget.category.sponsorships',   'income',  '#8B5CF6', 2),
  ('dashboard.budget.category.events',         'income',  '#F59E0B', 3),
  ('dashboard.budget.category.office',         'expense', '#EF4444', 4),
  ('dashboard.budget.category.technology',     'expense', '#EC4899', 5),
  ('dashboard.budget.category.marketing',      'expense', '#6366F1', 6),
  ('dashboard.budget.category.eventsCosts',    'expense', '#14B8A6', 7)
ON CONFLICT (name, fiscal_year) DO NOTHING;

-- ── Grants ────────────────────────────────────────────────────────────────
-- Supabase's default privileges normally cover new objects in `public`, but be
-- explicit so the panel doesn't fail with a bare permission error if they were
-- ever narrowed. RLS above is what actually restricts the rows.
GRANT SELECT, INSERT, UPDATE, DELETE ON bank_accounts         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON treasury_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON budget_categories     TO authenticated;
GRANT SELECT                         ON bank_account_balances TO authenticated;

COMMIT;
