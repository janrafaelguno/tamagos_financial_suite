import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import type { 
  Receipt, 
  Disbursement, 
  JournalEntry, 
  TrialBalanceItem, 
  FinancialKPIs,
  MonthlySummary,
  AuditLog,
  Category 
} from '@/types/finance';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_PATH = path.join(DB_DIR, 'finance.db');

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    initTables(_db);
  }
  return _db;
}

function initTables(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      client TEXT NOT NULL,
      description TEXT,
      invoice_no TEXT,
      cash_on_hand REAL DEFAULT 0,
      cash_in_bank REAL DEFAULT 0,
      cwt REAL DEFAULT 0,
      sales_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'Paid',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS disbursements (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      particulars TEXT NOT NULL,
      ref_no TEXT,
      amount REAL DEFAULT 0,
      category TEXT NOT NULL,
      payment_method TEXT DEFAULT 'Cash on Hand',
      status TEXT DEFAULT 'Paid',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      narration TEXT NOT NULL,
      ref_no TEXT,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      entry_type TEXT DEFAULT 'General',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      budget_limit REAL DEFAULT 0,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT DEFAULT (datetime('now')),
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      details TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Default categories
  const defaultCategories: Category[] = [
    { id: 'cat-1', name: 'Cost of Service', type: 'Expense', budget_limit: 100000, color: '#3b82f6' },
    { id: 'cat-2', name: 'Gasoline & Diesel', type: 'Expense', budget_limit: 30000, color: '#f59e0b' },
    { id: 'cat-3', name: 'Travel & Meal Expenses', type: 'Expense', budget_limit: 25000, color: '#10b981' },
    { id: 'cat-4', name: 'Supplies Expense', type: 'Expense', budget_limit: 20000, color: '#8b5cf6' },
    { id: 'cat-5', name: 'Transportation & Tolls', type: 'Expense', budget_limit: 15000, color: '#ec4899' },
    { id: 'cat-6', name: 'Accounts Payable', type: 'Expense', budget_limit: 50000, color: '#6366f1' },
    { id: 'cat-7', name: 'Commission Expense', type: 'Expense', budget_limit: 20000, color: '#14b8a6' },
    { id: 'cat-8', name: 'Telephone & Communication', type: 'Expense', budget_limit: 5000, color: '#06b6d4' },
    { id: 'cat-9', name: 'Vehicle Rental Expense', type: 'Expense', budget_limit: 30000, color: '#f97316' },
    { id: 'cat-10', name: 'Income Tax Payable', type: 'Expense', budget_limit: 50000, color: '#ef4444' },
    { id: 'cat-11', name: 'Delivery Fee', type: 'Expense', budget_limit: 10000, color: '#84cc16' },
    { id: 'cat-12', name: 'Other Expense', type: 'Expense', budget_limit: 15000, color: '#64748b' }
  ];

  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (catCount.count === 0) {
    const insertCat = db.prepare('INSERT INTO categories (id, name, type, budget_limit, color) VALUES (?, ?, ?, ?, ?)');
    for (const c of defaultCategories) {
      insertCat.run(c.id, c.name, c.type, c.budget_limit || 0, c.color || '#64748b');
    }
  }

  // Check if initial seeding needed
  const receiptCount = db.prepare('SELECT COUNT(*) as count FROM receipts').get() as { count: number };
  if (receiptCount.count === 0) {
    seedInitialData(db);
  }
}

function seedInitialData(db: DatabaseSync) {
  const seedFile = path.resolve(process.cwd(), 'seed_data.json');
  if (!fs.existsSync(seedFile)) return;

  try {
    const data = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));

    if (Array.isArray(data.receipts) && data.receipts.length > 0) {
      const ins = db.prepare(`
        INSERT INTO receipts (id, date, client, description, invoice_no, cash_on_hand, cash_in_bank, cwt, sales_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of data.receipts) {
        ins.run(
          r.id,
          r.date,
          r.client,
          r.description || '',
          r.invoice_no || '',
          r.cash_on_hand || 0,
          r.cash_in_bank || 0,
          r.cwt || 0,
          r.sales_amount || 0,
          r.status || 'Paid'
        );
      }
    }

    if (Array.isArray(data.disbursements) && data.disbursements.length > 0) {
      const ins = db.prepare(`
        INSERT INTO disbursements (id, date, particulars, ref_no, amount, category, payment_method, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const d of data.disbursements) {
        ins.run(
          d.id,
          d.date,
          d.particulars,
          d.ref_no || '',
          d.amount || 0,
          d.category || 'Other Expense',
          d.payment_method || 'Cash on Hand',
          d.status || 'Paid',
          d.notes || ''
        );
      }
    }

    if (Array.isArray(data.journal_entries) && data.journal_entries.length > 0) {
      const ins = db.prepare(`
        INSERT INTO journal_entries (id, date, narration, ref_no, debit, credit, entry_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const j of data.journal_entries) {
        ins.run(
          j.id,
          j.date,
          j.narration,
          j.ref_no || '',
          j.debit || 0,
          j.credit || 0,
          j.entry_type || 'General'
        );
      }
    }

    addAuditLogInternal(db, 'CREATE', 'SYSTEM', 'SEED', 'Preloaded historical data from Tamagos Financial Management spreadsheet');
  } catch (err) {
    console.error('Failed to seed initial data:', err);
  }
}

function addAuditLogInternal(db: DatabaseSync, action: string, entity: string, entity_id: string, details: string) {
  const id = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  db.prepare(`
    INSERT INTO audit_logs (id, timestamp, action, entity, entity_id, details)
    VALUES (?, datetime('now'), ?, ?, ?, ?)
  `).run(id, action, entity, entity_id, details);
}

export function logAudit(action: AuditLog['action'], entity: string, entity_id: string, details: string) {
  const db = getDb();
  addAuditLogInternal(db, action, entity, entity_id, details);
}

export function getAuditLogs(limit = 100): AuditLog[] {
  const db = getDb();
  return db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?').all(limit) as unknown as AuditLog[];
}

// ----------------- RECEIPTS CRUD -----------------
export function getReceipts(filters?: { search?: string; startDate?: string; endDate?: string; status?: string }): Receipt[] {
  const db = getDb();
  let query = 'SELECT * FROM receipts WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters?.search) {
    query += ' AND (client LIKE ? OR description LIKE ? OR invoice_no LIKE ?)';
    const s = `%${filters.search}%`;
    params.push(s, s, s);
  }
  if (filters?.startDate) {
    query += ' AND date >= ?';
    params.push(filters.startDate);
  }
  if (filters?.endDate) {
    query += ' AND date <= ?';
    params.push(filters.endDate);
  }
  if (filters?.status && filters.status !== 'All') {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  query += ' ORDER BY date DESC, id DESC';
  return db.prepare(query).all(...params) as unknown as Receipt[];
}

export function createReceipt(data: Omit<Receipt, 'id' | 'created_at' | 'updated_at'>): Receipt {
  const db = getDb();
  const countRow = db.prepare('SELECT COUNT(*) as c FROM receipts').get() as { c: number };
  const id = `REC-${(countRow.c + 1).toString().padStart(4, '0')}`;
  
  const sales = data.sales_amount || (data.cash_on_hand + data.cash_in_bank + data.cwt);

  db.prepare(`
    INSERT INTO receipts (id, date, client, description, invoice_no, cash_on_hand, cash_in_bank, cwt, sales_amount, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.date,
    data.client,
    data.description || '',
    data.invoice_no || '',
    data.cash_on_hand || 0,
    data.cash_in_bank || 0,
    data.cwt || 0,
    sales,
    data.status || 'Paid'
  );

  logAudit('CREATE', 'Receipt', id, `Created receipt for ${data.client} amount ₱${sales.toLocaleString()}`);
  return getReceipts().find(r => r.id === id)!;
}

export function updateReceipt(id: string, data: Partial<Receipt>): Receipt {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM receipts WHERE id = ?').get(id) as unknown as Receipt;
  if (!existing) throw new Error(`Receipt ${id} not found`);

  const updated = { ...existing, ...data };
  const sales = updated.sales_amount || (updated.cash_on_hand + updated.cash_in_bank + updated.cwt);

  db.prepare(`
    UPDATE receipts
    SET date = ?, client = ?, description = ?, invoice_no = ?, cash_on_hand = ?, cash_in_bank = ?, cwt = ?, sales_amount = ?, status = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    updated.date,
    updated.client,
    updated.description || '',
    updated.invoice_no || '',
    updated.cash_on_hand || 0,
    updated.cash_in_bank || 0,
    updated.cwt || 0,
    sales,
    updated.status,
    id
  );

  logAudit('UPDATE', 'Receipt', id, `Updated receipt ${id} for ${updated.client}`);
  return getReceipts().find(r => r.id === id)!;
}

export function deleteReceipt(id: string): boolean {
  const db = getDb();
  db.prepare('DELETE FROM receipts WHERE id = ?').run(id);
  logAudit('DELETE', 'Receipt', id, `Deleted receipt ${id}`);
  return true;
}

// ----------------- DISBURSEMENTS CRUD -----------------
export function getDisbursements(filters?: { search?: string; startDate?: string; endDate?: string; category?: string; status?: string }): Disbursement[] {
  const db = getDb();
  let query = 'SELECT * FROM disbursements WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters?.search) {
    query += ' AND (particulars LIKE ? OR ref_no LIKE ? OR category LIKE ?)';
    const s = `%${filters.search}%`;
    params.push(s, s, s);
  }
  if (filters?.startDate) {
    query += ' AND date >= ?';
    params.push(filters.startDate);
  }
  if (filters?.endDate) {
    query += ' AND date <= ?';
    params.push(filters.endDate);
  }
  if (filters?.category && filters.category !== 'All') {
    query += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters?.status && filters.status !== 'All') {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  query += ' ORDER BY date DESC, id DESC';
  return db.prepare(query).all(...params) as unknown as Disbursement[];
}

export function createDisbursement(data: Omit<Disbursement, 'id' | 'created_at' | 'updated_at'>): Disbursement {
  const db = getDb();
  const countRow = db.prepare('SELECT COUNT(*) as c FROM disbursements').get() as { c: number };
  const id = `DISB-${(countRow.c + 1).toString().padStart(4, '0')}`;

  db.prepare(`
    INSERT INTO disbursements (id, date, particulars, ref_no, amount, category, payment_method, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.date,
    data.particulars,
    data.ref_no || '',
    data.amount || 0,
    data.category || 'Other Expense',
    data.payment_method || 'Cash on Hand',
    data.status || 'Paid',
    data.notes || ''
  );

  logAudit('CREATE', 'Disbursement', id, `Logged disbursement ₱${(data.amount || 0).toLocaleString()} for ${data.particulars} [${data.category}]`);
  return getDisbursements().find(d => d.id === id)!;
}

export function updateDisbursement(id: string, data: Partial<Disbursement>): Disbursement {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM disbursements WHERE id = ?').get(id) as unknown as Disbursement;
  if (!existing) throw new Error(`Disbursement ${id} not found`);

  const updated = { ...existing, ...data };

  db.prepare(`
    UPDATE disbursements
    SET date = ?, particulars = ?, ref_no = ?, amount = ?, category = ?, payment_method = ?, status = ?, notes = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    updated.date,
    updated.particulars,
    updated.ref_no || '',
    updated.amount || 0,
    updated.category,
    updated.payment_method,
    updated.status,
    updated.notes || '',
    id
  );

  logAudit('UPDATE', 'Disbursement', id, `Updated disbursement ${id}`);
  return getDisbursements().find(d => d.id === id)!;
}

export function deleteDisbursement(id: string): boolean {
  const db = getDb();
  db.prepare('DELETE FROM disbursements WHERE id = ?').run(id);
  logAudit('DELETE', 'Disbursement', id, `Deleted disbursement ${id}`);
  return true;
}

// ----------------- JOURNAL ENTRIES CRUD -----------------
export function getJournalEntries(filters?: { search?: string; entry_type?: string }): JournalEntry[] {
  const db = getDb();
  let query = 'SELECT * FROM journal_entries WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters?.search) {
    query += ' AND (narration LIKE ? OR ref_no LIKE ?)';
    const s = `%${filters.search}%`;
    params.push(s, s);
  }
  if (filters?.entry_type && filters.entry_type !== 'All') {
    query += ' AND entry_type = ?';
    params.push(filters.entry_type);
  }

  query += ' ORDER BY date DESC, id DESC';
  return db.prepare(query).all(...params) as unknown as JournalEntry[];
}

export function createJournalEntry(data: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>): JournalEntry {
  const db = getDb();
  const countRow = db.prepare('SELECT COUNT(*) as c FROM journal_entries').get() as { c: number };
  const id = `GJ-${(countRow.c + 1).toString().padStart(4, '0')}`;

  db.prepare(`
    INSERT INTO journal_entries (id, date, narration, ref_no, debit, credit, entry_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.date,
    data.narration,
    data.ref_no || '',
    data.debit || 0,
    data.credit || 0,
    data.entry_type || 'General'
  );

  logAudit('CREATE', 'JournalEntry', id, `Recorded journal entry: ${data.narration.substring(0, 40)}`);
  return getJournalEntries().find(j => j.id === id)!;
}

export function deleteJournalEntry(id: string): boolean {
  const db = getDb();
  db.prepare('DELETE FROM journal_entries WHERE id = ?').run(id);
  logAudit('DELETE', 'JournalEntry', id, `Deleted journal entry ${id}`);
  return true;
}

// ----------------- CATEGORIES -----------------
export function getCategories(): Category[] {
  const db = getDb();
  return db.prepare('SELECT * FROM categories ORDER BY name ASC').all() as unknown as Category[];
}

// ----------------- FINANCIAL KPIS & ANALYTICS -----------------
export function getFinancialKPIs(year?: number): FinancialKPIs {
  const db = getDb();
  const yearFilter = year ? `strftime('%Y', date) = '${year}'` : '1=1';

  const revRow = db.prepare(`
    SELECT 
      COALESCE(SUM(sales_amount), 0) as totalRevenue,
      COALESCE(SUM(cash_on_hand), 0) as cashOnHand,
      COALESCE(SUM(cash_in_bank), 0) as cashInBank,
      COALESCE(SUM(cwt), 0) as totalCWT,
      COUNT(*) as activeInvoicesCount
    FROM receipts 
    WHERE ${yearFilter} AND status != 'Cancelled'
  `).get() as any;

  const disbRow = db.prepare(`
    SELECT 
      COALESCE(SUM(amount), 0) as totalExpenses,
      COUNT(*) as disbursementsCount
    FROM disbursements 
    WHERE ${yearFilter} AND status != 'Cancelled'
  `).get() as any;

  const totalRevenue = revRow.totalRevenue;
  const totalExpenses = disbRow.totalExpenses;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // BIR 8% regime estimation (Allowable deduction ₱250k once per year)
  const taxableGross = Math.max(0, totalRevenue - 250000);
  const rawTax = taxableGross * 0.08;
  const estimatedTaxPayable = Math.max(0, rawTax - revRow.totalCWT);

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin: Math.round(profitMargin * 10) / 10,
    cashOnHand: revRow.cashOnHand,
    cashInBank: revRow.cashInBank,
    totalCWT: revRow.totalCWT,
    estimatedTaxPayable: Math.round(estimatedTaxPayable * 100) / 100,
    activeInvoicesCount: revRow.activeInvoicesCount,
    disbursementsCount: disbRow.disbursementsCount,
  };
}

export function getMonthlyFinancials(year = 2026): MonthlySummary[] {
  const db = getDb();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const results: MonthlySummary[] = [];

  for (let m = 1; m <= 12; m++) {
    const mStr = m.toString().padStart(2, '0');
    // receipts date matching (handles YYYY-MM-DD or MM/DD/YYYY or YYYY)
    const recRow = db.prepare(`
      SELECT 
        COALESCE(SUM(cash_on_hand), 0) as coh,
        COALESCE(SUM(cash_in_bank), 0) as cib,
        COALESCE(SUM(cwt), 0) as cwt,
        COALESCE(SUM(sales_amount), 0) as sales
      FROM receipts
      WHERE (date LIKE '${year}-${mStr}%' OR date LIKE '${mStr}/%/${year}')
        AND status != 'Cancelled'
    `).get() as any;

    const disbRow = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as totalExp
      FROM disbursements
      WHERE (date LIKE '${year}-${mStr}%' OR date LIKE '${mStr}/%/${year}')
        AND status != 'Cancelled'
    `).get() as any;

    const sales = recRow.sales;
    const totalExp = disbRow.totalExp;
    const net = sales - totalExp;
    
    // Q1 exemption 250k check
    const allowableDeduction = (m === 1 || m === 3) && year === 2026 ? 250000 : 0;
    const taxableIncome = Math.max(0, sales - (m === 1 ? allowableDeduction : 0));
    const taxPayable = Math.max(0, taxableIncome * 0.08 - recRow.cwt);

    results.push({
      year,
      month: m,
      month_name: monthNames[m - 1],
      cash_on_hand: recRow.coh,
      cash_in_bank: recRow.cib,
      cwt: recRow.cwt,
      gross_sales: sales,
      total_expenses: totalExp,
      net_income: net,
      allowable_deduction: allowableDeduction,
      taxable_income: taxableIncome,
      tax_payable: taxPayable,
    });
  }

  return results;
}

export function getDisbursementCategoryBreakdown(year?: number): { name: string; value: number; color: string }[] {
  const db = getDb();
  const yearFilter = year ? `strftime('%Y', date) = '${year}' OR date LIKE '%/${year}'` : '1=1';

  const rows = db.prepare(`
    SELECT category as name, COALESCE(SUM(amount), 0) as value
    FROM disbursements
    WHERE ${yearFilter} AND status != 'Cancelled'
    GROUP BY category
    ORDER BY value DESC
  `).all() as { name: string; value: number }[];

  const colors = [
    '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', 
    '#6366f1', '#14b8a6', '#06b6d4', '#f97316', '#ef4444', '#84cc16', '#64748b'
  ];

  return rows.map((r, i) => ({
    name: r.name,
    value: Math.round(r.value * 100) / 100,
    color: colors[i % colors.length]
  }));
}

export function getTrialBalance(): { accounts: TrialBalanceItem[]; totalDebit: number; totalCredit: number; isBalanced: boolean; diff: number } {
  const db = getDb();
  
  // Aggregate real accounts from Receipts, Disbursements, and General Journal
  const recTotals = db.prepare(`
    SELECT 
      COALESCE(SUM(cash_on_hand), 0) as coh,
      COALESCE(SUM(cash_in_bank), 0) as cib,
      COALESCE(SUM(cwt), 0) as cwt,
      COALESCE(SUM(sales_amount), 0) as sales
    FROM receipts WHERE status != 'Cancelled'
  `).get() as any;

  const disbCats = db.prepare(`
    SELECT category, COALESCE(SUM(amount), 0) as total
    FROM disbursements WHERE status != 'Cancelled'
    GROUP BY category
  `).all() as { category: string; total: number }[];

  const gjTotals = db.prepare(`
    SELECT 
      COALESCE(SUM(debit), 0) as totalDebit,
      COALESCE(SUM(credit), 0) as totalCredit
    FROM journal_entries
  `).get() as any;

  const totalDisbursements = disbCats.reduce((acc, c) => acc + c.total, 0);

  const accounts: TrialBalanceItem[] = [
    {
      account_code: '101',
      account_title: 'Cash on Hand',
      category: 'Asset',
      debit_balance: Math.max(0, recTotals.coh - totalDisbursements),
      credit_balance: 0,
    },
    {
      account_code: '102',
      account_title: 'Cash in Bank',
      category: 'Asset',
      debit_balance: recTotals.cib,
      credit_balance: 0,
    },
    {
      account_code: '115',
      account_title: 'Creditable Withholding Tax (2307 CWT)',
      category: 'Asset',
      debit_balance: recTotals.cwt,
      credit_balance: 0,
    },
    {
      account_code: '401',
      account_title: 'Sales & Service Revenue',
      category: 'Revenue',
      debit_balance: 0,
      credit_balance: recTotals.sales,
    },
    {
      account_code: '301',
      account_title: "Owner's Equity & Retained Earnings",
      category: 'Equity',
      debit_balance: 0,
      credit_balance: gjTotals.totalCredit > 0 ? gjTotals.totalCredit : recTotals.sales - totalDisbursements,
    },
  ];

  // Add expense categories
  let code = 501;
  for (const c of disbCats) {
    accounts.push({
      account_code: `${code++}`,
      account_title: c.category,
      category: 'Expense',
      debit_balance: c.total,
      credit_balance: 0,
    });
  }

  const totalDebit = accounts.reduce((acc, a) => acc + a.debit_balance, 0);
  const totalCredit = accounts.reduce((acc, a) => acc + a.credit_balance, 0);
  const diff = Math.round(Math.abs(totalDebit - totalCredit) * 100) / 100;

  return {
    accounts,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    isBalanced: diff < 1.0,
    diff,
  };
}
