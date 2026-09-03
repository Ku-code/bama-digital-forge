import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  loadAccounts,
  loadTransactions,
  loadBudgetCategories,
  createTransaction,
  deleteTransaction,
  withActuals,
  type BankAccount,
  type Transaction,
  type BudgetCategory,
} from "@/lib/treasury";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { bg, enUS } from "date-fns/locale";
import {
  DollarSign,
  Building2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Wallet,
  PiggyBank,
  Receipt,
  CreditCard,
  BarChart3,
  Calendar,
  Download,
  FileText,
  Shield,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Info
} from "lucide-react";

const EXPENSE_CATEGORIES = [
  "dashboard.budget.category.office", "dashboard.budget.category.technology", "dashboard.budget.category.marketing", "dashboard.budget.category.eventsCosts", "dashboard.budget.category.travel", "dashboard.budget.category.legal", "dashboard.budget.category.consulting", "dashboard.budget.category.services", "dashboard.budget.category.other"
];

const INCOME_CATEGORIES = [
  "dashboard.budget.category.membershipFees", "dashboard.budget.category.grants", "dashboard.budget.category.sponsorships", "dashboard.budget.category.events", "dashboard.budget.category.services", "dashboard.budget.category.donations", "dashboard.budget.category.other"
];

const BudgetContent = () => {
  const { t, language } = useLanguage();
  const { user, isSuperAdmin, isAdmin, isBoardMember } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const [accountRows, txnRows, categoryRows] = await Promise.all([
        loadAccounts(),
        loadTransactions(),
        loadBudgetCategories(),
      ]);
      setAccounts(accountRows);
      setTransactions(txnRows);
      // "Actual" is summed from the ledger so it can't drift from it.
      setBudget(withActuals(categoryRows, txnRows));
    } catch (error) {
      console.error("Error loading treasury data:", error);
      toast({
        title: t("dashboard.budget.error.load") || "Couldn't load budget",
        description:
          t("dashboard.budget.error.loadDesc") ||
          "The treasury data could not be loaded. Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Exports the transaction ledger as CSV. RFC 4180 quoting so descriptions
   *  containing commas, quotes or newlines survive the round-trip into Excel. */
  const handleExportCsv = () => {
    const columns: { header: string; value: (tx: Transaction) => string | number }[] = [
      { header: "Date", value: (tx) => tx.txn_date },
      { header: "Description", value: (tx) => tx.description },
      { header: "Type", value: (tx) => tx.category },
      { header: "Category", value: (tx) => tx.subcategory },
      { header: "Amount", value: (tx) => tx.amount },
      { header: "Currency", value: (tx) => tx.currency },
      { header: "Account", value: (tx) => accounts.find((a) => a.id === tx.account_id)?.name ?? tx.account_id },
      { header: "Reference", value: (tx) => tx.reference ?? "" },
      { header: "Notes", value: (tx) => tx.notes ?? "" },
    ];

    const escape = (value: string | number) => {
      const text = String(value);
      return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const rows = [
      columns.map((c) => escape(c.header)).join(","),
      ...transactions.map((tx) => columns.map((c) => escape(c.value(tx))).join(",")),
    ];

    // Prepend a BOM so Excel reads the Cyrillic descriptions as UTF-8.
    const blob = new Blob(["\uFEFF" + rows.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bamas-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: t("dashboard.budget.export.success") || "Export ready",
      description:
        t("dashboard.budget.export.description") ||
        `${transactions.length} transaction(s) exported to CSV.`,
    });
  };
  const [showIban, setShowIban] = useState<Record<string, boolean>>({});
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    category: "expense" as Transaction["category"],
    subcategory: "",
    amount: "",
    currency: "BGN" as Transaction["currency"],
    account_id: "",
    reference: "",
    notes: "",
  });

  const dateLocale = language === 'bg' ? bg : enUS;
  const canManage = isSuperAdmin || isAdmin || isBoardMember;

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => {
    // Convert EUR to BGN for total (approximate rate)
    const amount = acc.currency === 'EUR' ? acc.balance * 1.96 : acc.balance;
    return sum + amount;
  }, 0);

  const currentMonthPrefix = new Date().toISOString().slice(0, 7);

  const currentMonthIncome = transactions
    .filter((tx) => tx.category === 'income' && tx.txn_date.startsWith(currentMonthPrefix))
    .reduce((sum, tx) => sum + (tx.currency === 'EUR' ? tx.amount * 1.96 : tx.amount), 0);

  const currentMonthExpenses = transactions
    .filter((tx) => tx.category === 'expense' && tx.txn_date.startsWith(currentMonthPrefix))
    .reduce((sum, tx) => sum + (tx.currency === 'EUR' ? tx.amount * 1.96 : tx.amount), 0);

  const totalBudgetedIncome = budget.filter(b => b.type === 'income').reduce((sum, b) => sum + b.budgeted, 0);
  const totalActualIncome = budget.filter(b => b.type === 'income').reduce((sum, b) => sum + b.actual, 0);
  const totalBudgetedExpenses = budget.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.budgeted, 0);
  const totalActualExpenses = budget.filter(b => b.type === 'expense').reduce((sum, b) => sum + b.actual, 0);

  const toggleIbanVisibility = (accountId: string) => {
    setShowIban(prev => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(language === 'bg' ? 'bg-BG' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: t("dashboard.budget.bankDetails.copied") || "Copied to clipboard!",
      duration: 2000,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.account_id) {
      toast({
        title: t("dashboard.budget.error.validation") || "Validation Error",
        description: t("dashboard.budget.error.required") || "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      toast({
        title: t("dashboard.budget.error.validation") || "Validation Error",
        description: t("dashboard.budget.error.amount") || "Enter a valid, non-negative amount.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await createTransaction({
        txn_date: new Date().toISOString().split("T")[0],
        description: newTransaction.description,
        category: newTransaction.category,
        subcategory: newTransaction.subcategory,
        amount,
        currency: newTransaction.currency,
        account_id: newTransaction.account_id,
        reference: newTransaction.reference || undefined,
        notes: newTransaction.notes || undefined,
        created_by: user?.id,
      });

      // Balances and budget actuals are derived, so a reload is what refreshes
      // them — there is no local figure to nudge by hand.
      await reload();

      setNewTransaction({
        description: "",
        category: "expense",
        subcategory: "",
        amount: "",
        currency: "BGN",
        account_id: "",
        reference: "",
        notes: "",
      });
      setIsAddTransactionOpen(false);

      toast({
        title: t("dashboard.budget.success.transaction") || "Transaction Added",
        description: t("dashboard.budget.success.transactionDesc") || "Transaction recorded successfully",
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast({
        title: t("dashboard.budget.error.save") || "Couldn't save transaction",
        description:
          error instanceof Error
            ? error.message
            : t("dashboard.budget.error.saveDesc") || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      await reload();
      toast({
        title: t("dashboard.budget.success.deleted") || "Transaction deleted",
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: t("dashboard.budget.error.delete") || "Couldn't delete transaction",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    }
  };

  const getAccountIcon = (type: BankAccount["type"]) => {
    switch (type) {
      case 'checking': return <Wallet className="h-5 w-5" />;
      case 'savings': return <PiggyBank className="h-5 w-5" />;
      case 'grant': return <Shield className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const bankAccountsDetails = [
    {
      accountName: t("dashboard.budget.bankDetails.account1Name") || "Account 1",
      accountNumber: "EVP3410018837611",
      iban: "BG55BPBI79421200077761",
      bankName: "EUROBANK BULGARIA AD",
      swift: "BPBIBGSFXXX",
      recipient: t("dashboard.budget.bankDetails.recipientName") || "БЪЛГАРСКА АСОЦИАЦИЯ ЗА АДИТИВНО ПРОИЗВОДСТВО",
      address: "260 OKOLOVRASTEN PAT STR. SOFIA 1766, BULGARIA"
    },
    {
      accountName: t("dashboard.budget.bankDetails.account2Name") || "Account 2",
      iban: "LT443500010018837611",
      bankName: "Paysera LT, UAB",
      swift: "EVIULT2VXXX",
      recipient: t("dashboard.budget.bankDetails.recipientName") || "БЪЛГАРСКА АСОЦИАЦИЯ ЗА АДИТИВНО ПРОИЗВОДСТВО",
      address: "Pilaitės pr. 16, Vilnius, LT-04352, Lithuania"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          <h2 className="text-2xl font-bold">{t("dashboard.budget.title") || "Budget & Financials"}</h2>
        </div>
        <div className="flex gap-2">
          <Button
            className="rounded-full"
            onClick={() => setShowBankDetails(true)}
          >
            <Building2 className="mr-2 h-4 w-4" />
            {t("dashboard.budget.bankDetails") || "BANK ACCOUNT DETAILS"}
          </Button>
          {canManage && (
            <Button onClick={() => setIsAddTransactionOpen(true)} className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              {t("dashboard.budget.addTransaction") || "Add Transaction"}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboard.budget.totalBalance") || "Total Balance"}</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBalance, 'BGN')}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboard.budget.monthlyIncome") || "This Month Income"}</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(currentMonthIncome, 'BGN')}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboard.budget.monthlyExpenses") || "This Month Expenses"}</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(currentMonthExpenses, 'BGN')}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboard.budget.netFlow") || "Net Cash Flow"}</p>
                <p className={`text-2xl font-bold ${currentMonthIncome - currentMonthExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(currentMonthIncome - currentMonthExpenses, 'BGN')}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="rounded-full">
          <TabsTrigger value="overview" className="rounded-full">{t("dashboard.budget.tabs.overview") || "Overview"}</TabsTrigger>
          <TabsTrigger value="accounts" className="rounded-full">{t("dashboard.budget.tabs.accounts") || "Bank Accounts"}</TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-full">{t("dashboard.budget.tabs.transactions") || "Transactions"}</TabsTrigger>
          <TabsTrigger value="budget" className="rounded-full">{t("dashboard.budget.tabs.budget") || "Annual Budget"}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Income vs Budget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                  {t("dashboard.budget.income") || "Income"}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.budget.incomeVsBudget") || "Income vs Annual Budget"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {budget.filter(b => b.type === 'income').map(category => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t(category.name)}</span>
                      <span className="font-medium">
                        {formatCurrency(category.actual, 'BGN')} / {formatCurrency(category.budgeted, 'BGN')}
                      </span>
                    </div>
                    <Progress
                      value={(category.actual / category.budgeted) * 100}
                      className="h-2"
                      style={{ '--progress-color': category.color } as any}
                    />
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>{t("dashboard.budget.total") || "Total"}</span>
                  <span className="text-green-600">
                    {formatCurrency(totalActualIncome, 'BGN')} / {formatCurrency(totalBudgetedIncome, 'BGN')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Expenses vs Budget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownLeft className="h-5 w-5 text-red-600" />
                  {t("dashboard.budget.expenses") || "Expenses"}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.budget.expensesVsBudget") || "Expenses vs Annual Budget"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {budget.filter(b => b.type === 'expense').map(category => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t(category.name)}</span>
                      <span className="font-medium">
                        {formatCurrency(category.actual, 'BGN')} / {formatCurrency(category.budgeted, 'BGN')}
                      </span>
                    </div>
                    <Progress
                      value={(category.actual / category.budgeted) * 100}
                      className="h-2"
                      style={{ '--progress-color': category.color } as any}
                    />
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>{t("dashboard.budget.total") || "Total"}</span>
                  <span className="text-red-600">
                    {formatCurrency(totalActualExpenses, 'BGN')} / {formatCurrency(totalBudgetedExpenses, 'BGN')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                {t("dashboard.budget.recentTransactions") || "Recent Transactions"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("dashboard.budget.table.date") || "Date"}</TableHead>
                    <TableHead>{t("dashboard.budget.table.description") || "Description"}</TableHead>
                    <TableHead>{t("dashboard.budget.table.category") || "Category"}</TableHead>
                    <TableHead className="text-right">{t("dashboard.budget.table.amount") || "Amount"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 5).map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(tx.txn_date), 'PP', { locale: dateLocale })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          {tx.reference && (
                            <p className="text-xs text-muted-foreground">{tx.reference}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full">{t(tx.subcategory)}</Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${tx.category === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.category === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(account => (
              <Card key={account.id} className={account.is_primary ? 'border-primary' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAccountIcon(account.type)}
                      <CardTitle className="text-base">{t(account.name)}</CardTitle>
                    </div>
                    {account.is_primary && (
                      <Badge className="rounded-full">{t("dashboard.budget.primary") || "Primary"}</Badge>
                    )}
                  </div>
                  <CardDescription>{account.bank_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">IBAN:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {showIban[account.id] ? account.iban : account.iban.replace(/\d{6}$/, '******')}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleIbanVisibility(account.id)}
                      >
                        {showIban[account.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("dashboard.budget.balance") || "Balance"}:</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(account.balance, account.currency)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("dashboard.budget.allTransactions") || "All Transactions"}</CardTitle>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={handleExportCsv}
                  disabled={transactions.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("dashboard.budget.export") || "Export CSV"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("dashboard.budget.table.date") || "Date"}</TableHead>
                    <TableHead>{t("dashboard.budget.table.description") || "Description"}</TableHead>
                    <TableHead>{t("dashboard.budget.table.category") || "Category"}</TableHead>
                    <TableHead>{t("dashboard.budget.table.account") || "Account"}</TableHead>
                    <TableHead>{t("dashboard.budget.table.reference") || "Reference"}</TableHead>
                    <TableHead className="text-right">{t("dashboard.budget.table.amount") || "Amount"}</TableHead>
                    {canManage && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(tx => {
                    const account = accounts.find(a => a.id === tx.account_id);
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(tx.txn_date), 'PP', { locale: dateLocale })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.description}</p>
                            {tx.notes && (
                              <p className="text-xs text-muted-foreground">{tx.notes}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={tx.category === 'income' ? 'default' : 'secondary'} className="rounded-full">
                            {t(tx.subcategory)}
                          </Badge>
                        </TableCell>
                        <TableCell>{t(account?.name || '')}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {tx.reference || '-'}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${tx.category === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.category === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                        </TableCell>
                        {canManage && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                              onClick={() => setPendingDeleteId(tx.id)}
                              aria-label={t("dashboard.budget.table.delete") || "Delete transaction"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Annual Budget Tab */}
        <TabsContent value="budget">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Income Budget */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">{t("dashboard.budget.incomeCategories") || "Income Categories"}</CardTitle>
                <CardDescription>
                  {t("dashboard.budget.annualBudget") || "Annual budget allocation"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("dashboard.budget.table.category") || "Category"}</TableHead>
                      <TableHead className="text-right">{t("dashboard.budget.table.budgeted") || "Budgeted"}</TableHead>
                      <TableHead className="text-right">{t("dashboard.budget.table.actual") || "Actual"}</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budget.filter(b => b.type === 'income').map(category => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(category.budgeted, 'BGN')}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(category.actual, 'BGN')}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="rounded-full">
                            {Math.round((category.actual / category.budgeted) * 100)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex justify-between w-full font-semibold">
                  <span>{t("dashboard.budget.total") || "Total"}</span>
                  <span className="text-green-600">{formatCurrency(totalBudgetedIncome, 'BGN')}</span>
                </div>
              </CardFooter>
            </Card>

            {/* Expense Budget */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">{t("dashboard.budget.expenseCategories") || "Expense Categories"}</CardTitle>
                <CardDescription>
                  {t("dashboard.budget.annualBudget") || "Annual budget allocation"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("dashboard.budget.table.category") || "Category"}</TableHead>
                      <TableHead className="text-right">{t("dashboard.budget.table.budgeted") || "Budgeted"}</TableHead>
                      <TableHead className="text-right">{t("dashboard.budget.table.actual") || "Actual"}</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budget.filter(b => b.type === 'expense').map(category => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(category.budgeted, 'BGN')}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(category.actual, 'BGN')}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={category.actual > category.budgeted ? 'destructive' : 'outline'} className="rounded-full">
                            {Math.round((category.actual / category.budgeted) * 100)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex justify-between w-full font-semibold">
                  <span>{t("dashboard.budget.total") || "Total"}</span>
                  <span className="text-red-600">{formatCurrency(totalBudgetedExpenses, 'BGN')}</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Transaction Dialog */}
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("dashboard.budget.addTransaction") || "Add Transaction"}</DialogTitle>
            <DialogDescription>
              {t("dashboard.budget.addTransactionDesc") || "Record a new income or expense"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("dashboard.budget.form.type") || "Type"}</Label>
              <div className="flex gap-2">
                <Button
                  variant={newTransaction.category === 'income' ? 'default' : 'outline'}
                  className="flex-1 rounded-full"
                  onClick={() => setNewTransaction(prev => ({ ...prev, category: 'income', subcategory: '' }))}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  {t("dashboard.budget.income") || "Income"}
                </Button>
                <Button
                  variant={newTransaction.category === 'expense' ? 'default' : 'outline'}
                  className="flex-1 rounded-full"
                  onClick={() => setNewTransaction(prev => ({ ...prev, category: 'expense', subcategory: '' }))}
                >
                  <ArrowDownLeft className="mr-2 h-4 w-4" />
                  {t("dashboard.budget.expenses") || "Expenses"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("dashboard.budget.form.description") || "Description"} *</Label>
              <Input
                value={newTransaction.description}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t("dashboard.budget.form.descriptionPlaceholder") || "Enter description..."}
                className="rounded-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("dashboard.budget.form.amount") || "Amount"} *</Label>
                <Input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="rounded-full"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dashboard.budget.form.currency") || "Currency"}</Label>
                <Select
                  value={newTransaction.currency}
                  onValueChange={(v) => setNewTransaction(prev => ({ ...prev, currency: v as 'BGN' | 'EUR' }))}
                >
                  <SelectTrigger className="rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BGN">BGN (лв.)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("dashboard.budget.form.category") || "Category"}</Label>
              <Select
                value={newTransaction.subcategory}
                onValueChange={(v) => setNewTransaction(prev => ({ ...prev, subcategory: v }))}
              >
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder={t("dashboard.budget.form.selectCategory") || "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {(newTransaction.category === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                    <SelectItem key={cat} value={cat}>{t(cat)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("dashboard.budget.form.account") || "Account"} *</Label>
              <Select
                value={newTransaction.account_id}
                onValueChange={(v) => setNewTransaction(prev => ({ ...prev, account_id: v }))}
              >
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder={t("dashboard.budget.form.selectAccount") || "Select account"} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {t(acc.name)} ({acc.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("dashboard.budget.form.reference") || "Reference"}</Label>
              <Input
                value={newTransaction.reference}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, reference: e.target.value }))}
                placeholder={t("dashboard.budget.form.referencePlaceholder") || "Invoice number, etc."}
                className="rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("dashboard.budget.form.notes") || "Notes"}</Label>
              <Textarea
                value={newTransaction.notes}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={t("dashboard.budget.form.notesPlaceholder") || "Additional notes..."}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTransactionOpen(false)} className="rounded-full">
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button onClick={handleAddTransaction} className="rounded-full" disabled={isSaving}>
              {t("dashboard.budget.save") || "Save Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bank Account Details Dialog */}
      <Dialog open={showBankDetails} onOpenChange={setShowBankDetails}>
        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-md border border-white/20 p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
              <Building2 className="h-6 w-6 text-primary" />
              {t("dashboard.budget.bankDetails.title") || "Bank Account Information"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-1">
              {t("dashboard.budget.bankDetails.description") || "Transfer details for BAMA's financial transactions"}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {bankAccountsDetails.map((details, index) => (
              <div key={index} className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4">
                  <Building2 className="h-16 w-16 opacity-5 group-hover:opacity-10 transition-opacity duration-300" />
                </div>

                <div className="flex justify-between items-center relative z-10">
                  <span className="font-bold text-lg text-primary">{details.accountName} - {details.bankName}</span>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{index === 0 ? "Primary" : "Secondary"}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                  {details.accountNumber && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("dashboard.budget.bankDetails.accountNumber") || "Account Number"}</Label>
                      <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-white/10 group/row hover:border-primary/40 transition-colors">
                        <code className="text-sm font-mono text-white/90">{details.accountNumber}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/20 hover:text-primary transition-colors"
                          onClick={() => handleCopy(details.accountNumber!, `acc-${index}`)}
                        >
                          {copiedField === `acc-${index}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("dashboard.budget.bankDetails.iban") || "IBAN"}</Label>
                    <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-white/10 group/row hover:border-primary/40 transition-colors">
                      <code className="text-sm font-mono text-white/90">{details.iban}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/20 hover:text-primary transition-colors"
                        onClick={() => handleCopy(details.iban, `iban-${index}`)}
                      >
                        {copiedField === `iban-${index}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("dashboard.budget.bankDetails.swift") || "SWIFT / BIC"}</Label>
                    <div className="text-sm font-medium bg-white/5 py-2 px-3 rounded-xl border border-white/5">{details.swift}</div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("dashboard.budget.bankDetails.recipientLabel") || "Recipient"}</Label>
                    <div className="text-sm font-medium bg-white/5 py-2 px-3 rounded-xl border border-white/5 leading-tight">{details.recipient}</div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-white/10 relative z-10">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <Info className="h-3 w-3" />
                    {t("dashboard.budget.bankDetails.recipientEntity") || "Recipient Entity (Legal Name)"}
                  </Label>
                  <p className="text-sm font-bold text-primary bg-primary/5 py-2 px-3 rounded-xl inline-block">{t("dashboard.budget.bankDetails.recipientNameEn") || "Bulgarian Additive Manufacturing Association"}</p>
                </div>

                <div className="space-y-1.5 relative z-10">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("dashboard.budget.bankDetails.bankAddress") || "Bank Address"}</Label>
                  <div className="text-sm bg-white/5 py-2 px-3 rounded-xl border border-white/5 italic opacity-80">{details.address}</div>
                </div>
              </div>
            ))}

            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3 items-start">
              <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200/80 leading-relaxed">
                {t("dashboard.budget.bankDetails.info") || "Please include your Membership ID or Invoice Number in the payment description to ensure faster processing. For international transfers, please use the EUR account (Account 2)."}\n
              </p>
            </div>
          </div>

          <DialogFooter className="p-6 pt-0">
            <Button variant="outline" className="rounded-full w-full sm:w-auto h-11 px-8 font-semibold border-white/10 hover:bg-white/5" onClick={() => setShowBankDetails(false)}>
              {t("common.close") || "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deleting a financial record is not undoable — always confirm. */}
      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.budget.delete.title") || "Delete this transaction?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.budget.delete.description") ||
                "This removes the entry from the ledger permanently. Account balances and budget figures will be recalculated."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              {t("common.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const id = pendingDeleteId;
                setPendingDeleteId(null);
                if (id) void handleDeleteTransaction(id);
              }}
            >
              {t("common.delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BudgetContent;

