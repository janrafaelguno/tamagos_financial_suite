'use client';

import React from 'react';
import { FinancialKPIs, MonthlySummary, Receipt, Disbursement } from '@/types/finance';
import { KPICards } from './KPICards';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';

interface DashboardViewProps {
  kpis: FinancialKPIs | null;
  monthlyData: MonthlySummary[];
  categoryBreakdown: { name: string; value: number; color: string }[];
  recentReceipts: Receipt[];
  recentDisbursements: Disbursement[];
  currency: 'PHP' | 'USD';
  selectedYear: number;
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  monthlyData,
  categoryBreakdown,
  recentReceipts,
  recentDisbursements,
  currency,
  selectedYear,
  onNavigate,
}) => {
  const sym = currency === 'PHP' ? '₱' : '$';
  const format = (n?: number) => `${sym}${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // Chart data
  const chartData = monthlyData.map(m => ({
    name: m.month_name,
    Revenue: m.gross_sales,
    Expenses: m.total_expenses,
    Profit: m.net_income,
  }));

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <KPICards kpis={kpis} currency={currency} selectedYear={selectedYear} />

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Monthly Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cash Flow Dynamics (FY {selectedYear})</h3>
              <p className="text-xs text-slate-500">Monthly Revenue vs Operational Disbursements</p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Sales
              </span>
              <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Expenses
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `${sym}${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val: any) => [`${sym}${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Expense Allocations</h3>
              <button 
                onClick={() => onNavigate('disbursements')} 
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Breakdown of operational disbursements</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryBreakdown.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`${sym}${Number(val).toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {categoryBreakdown.slice(0, 4).map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-slate-600 dark:text-slate-400 truncate">{cat.name}</span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">{format(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Receipts & Recent Disbursements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cash Receipts (CRJ) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Sales & Invoices (CRJ)</h3>
            </div>
            <button 
              onClick={() => onNavigate('receipts')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              All Receipts <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentReceipts.slice(0, 5).map((r) => (
              <div key={r.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between text-xs transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{r.client}</p>
                    <p className="text-[11px] text-slate-400">{r.date} • {r.invoice_no ? `SI #${r.invoice_no}` : r.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">+{format(r.sales_amount)}</p>
                  <p className="text-[10px] text-slate-400">
                    {r.cash_in_bank > 0 ? `Bank: ${format(r.cash_in_bank)}` : `Cash: ${format(r.cash_on_hand)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Cash Disbursements (CDJ) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Disbursements (CDJ)</h3>
            </div>
            <button 
              onClick={() => onNavigate('disbursements')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              All Expenses <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentDisbursements.slice(0, 5).map((d) => (
              <div key={d.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between text-xs transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{d.particulars}</p>
                    <p className="text-[11px] text-slate-400">{d.date} • <span className="text-blue-500">{d.category}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-600 dark:text-amber-400">-{format(d.amount)}</p>
                  <p className="text-[10px] text-slate-400">{d.ref_no || d.payment_method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BIR & Accounting Compliance Status Card */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-blue-200/80 dark:border-blue-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Tamagos Financial Health & BIR Compliance</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              TRAIN Law 8% Gross Income Tax regime active. ₱250k annual personal deduction monitored with creditable withholding tax (2307) ledger.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('tax-center')}
          className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          Open BIR 1701Q Calculator
        </button>
      </div>
    </div>
  );
};
