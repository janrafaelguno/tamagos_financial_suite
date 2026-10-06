export interface Receipt {
  id: string;
  date: string;
  client: string;
  description: string;
  invoice_no: string;
  cash_on_hand: number;
  cash_in_bank: number;
  cwt: number;
  sales_amount: number;
  status: 'Paid' | 'Pending' | 'Cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface Disbursement {
  id: string;
  date: string;
  particulars: string;
  ref_no: string;
  amount: number;
  category: string;
  payment_method: 'Cash on Hand' | 'Bank Transfer' | 'Petty Cash' | 'Check' | 'GCash';
  status: 'Paid' | 'Pending' | 'Reimbursed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  narration: string;
  ref_no: string;
  debit: number;
  credit: number;
  entry_type: 'Bank Transfer' | 'Owner Drawing / ATM' | 'Bank Fee' | 'Tax Payment' | 'Adjustment' | 'General';
  created_at?: string;
  updated_at?: string;
}

export interface TrialBalanceItem {
  account_code: string;
  account_title: string;
  category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  debit_balance: number;
  credit_balance: number;
}

export interface MonthlySummary {
  year: number;
  month: number;
  month_name: string;
  cash_on_hand: number;
  cash_in_bank: number;
  cwt: number;
  gross_sales: number;
  total_expenses: number;
  net_income: number;
  allowable_deduction: number;
  taxable_income: number;
  tax_payable: number;
  remarks?: string;
}

export interface FinancialKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  cashOnHand: number;
  cashInBank: number;
  totalCWT: number;
  estimatedTaxPayable: number;
  activeInvoicesCount: number;
  disbursementsCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'SETTINGS';
  entity: string;
  entity_id: string;
  details: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'Expense' | 'Revenue' | 'Asset';
  budget_limit?: number;
  color?: string;
}
