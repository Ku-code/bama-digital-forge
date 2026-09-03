import { supabase } from './supabase';

/**
 * Association treasury: bank accounts, the transaction ledger and the annual
 * budget lines behind the Budget dashboard panel.
 *
 * Two figures are deliberately NOT stored and are derived instead, so they can
 * never drift from the ledger:
 *   - an account's balance  (opening_balance +/- its transactions)
 *   - a budget line's actual (sum of matching transactions)
 */

export type TxnCategory = 'income' | 'expense';
export type Currency = 'BGN' | 'EUR';

export interface BankAccount {
  id: string;
  name: string;
  bank_name: string;
  iban: string;
  currency: Currency;
  opening_balance: number;
  /** Derived by the `bank_account_balances` view. */
  balance: number;
  type: 'checking' | 'savings' | 'grant';
  is_primary: boolean;
  sort_order: number;
}

export interface Transaction {
  id: string;
  txn_date: string;
  description: string;
  category: TxnCategory;
  subcategory: string;
  amount: number;
  currency: Currency;
  account_id: string;
  reference?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  type: TxnCategory;
  budgeted: number;
  color: string;
  fiscal_year: number;
  sort_order: number;
  /** Derived client-side from the ledger — see `withActuals`. */
  actual: number;
}

/** Numeric columns arrive from PostgREST as strings; normalise once, here. */
const num = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value ?? 0));
  return Number.isFinite(parsed) ? parsed : 0;
};

// ── Accounts ────────────────────────────────────────────────────────────────

export const loadAccounts = async (): Promise<BankAccount[]> => {
  const { data, error } = await supabase
    .from('bank_account_balances')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map((row: Record<string, unknown>) => ({
    ...(row as unknown as BankAccount),
    opening_balance: num(row.opening_balance),
    balance: num(row.balance),
  }));
};

export const updateAccount = async (
  id: string,
  patch: Partial<Pick<BankAccount, 'name' | 'bank_name' | 'iban' | 'currency' | 'opening_balance' | 'type' | 'is_primary'>>
): Promise<void> => {
  const { error } = await (supabase.from('bank_accounts') as ReturnType<typeof supabase.from>)
    .update(patch as Record<string, unknown>)
    .eq('id', id);
  if (error) throw error;
};

// ── Transactions ────────────────────────────────────────────────────────────

export const loadTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('treasury_transactions')
    .select('*')
    .order('txn_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((row: Record<string, unknown>) => ({
    ...(row as unknown as Transaction),
    amount: num(row.amount),
  }));
};

export const createTransaction = async (
  input: Omit<Transaction, 'id' | 'created_at'>
): Promise<Transaction> => {
  const { data, error } = await (supabase.from('treasury_transactions') as ReturnType<typeof supabase.from>)
    .insert(input as Record<string, unknown>)
    .select()
    .single();

  if (error) throw error;
  return { ...(data as unknown as Transaction), amount: num((data as Record<string, unknown>).amount) };
};

export const updateTransaction = async (
  id: string,
  patch: Partial<Omit<Transaction, 'id' | 'created_at' | 'created_by'>>
): Promise<void> => {
  const { error } = await (supabase.from('treasury_transactions') as ReturnType<typeof supabase.from>)
    .update(patch as Record<string, unknown>)
    .eq('id', id);
  if (error) throw error;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase.from('treasury_transactions').delete().eq('id', id);
  if (error) throw error;
};

// ── Budget lines ────────────────────────────────────────────────────────────

export const loadBudgetCategories = async (
  fiscalYear: number = new Date().getFullYear()
): Promise<BudgetCategory[]> => {
  const { data, error } = await supabase
    .from('budget_categories')
    .select('*')
    .eq('fiscal_year', fiscalYear)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []).map((row: Record<string, unknown>) => ({
    ...(row as unknown as BudgetCategory),
    budgeted: num(row.budgeted),
    actual: 0,
  }));
};

export const updateBudgetCategory = async (
  id: string,
  patch: Partial<Pick<BudgetCategory, 'name' | 'type' | 'budgeted' | 'color'>>
): Promise<void> => {
  const { error } = await (supabase.from('budget_categories') as ReturnType<typeof supabase.from>)
    .update(patch as Record<string, unknown>)
    .eq('id', id);
  if (error) throw error;
};

/**
 * Fills each budget line's `actual` from the ledger. Matching is on
 * (subcategory === name) AND (category === type), which mirrors how the
 * transaction form populates those fields from the same key list.
 */
export const withActuals = (
  categories: BudgetCategory[],
  transactions: Transaction[]
): BudgetCategory[] =>
  categories.map((cat) => ({
    ...cat,
    actual: transactions
      .filter((tx) => tx.subcategory === cat.name && tx.category === cat.type)
      .reduce((sum, tx) => sum + tx.amount, 0),
  }));
