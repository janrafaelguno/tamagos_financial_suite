'use client';

import React from 'react';
import { FinancialKPIs } from '@/types/finance';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  Building2, 
  Receipt, 
  Percent, 
  ShieldAlert,
  Coins
} from 'lucide-react';

interface KPICardsProps {
  kpis: FinancialKPIs | null;
  currency: 'PHP' | 'USD';
  selectedYear: number;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, currency, selectedYear }) => {
  const sym = currency === 'PHP' ? '₱' : '$';
  const format = (n?: number) => `${sym}${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (!kpis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-200 dark:border-slate-800" />
        ))}
      </div>
    );
  }

  const isProfitable = kpis.netProfit >= 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gross Revenue (CRJ)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {format(kpis.totalRevenue)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {kpis.activeInvoicesCount} Recorded Invoices ({selectedYear})
            </p>
          </div>
        </div>

        {/* Total Disbursements */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Expenses (CDJ)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {format(kpis.totalExpenses)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {kpis.disbursementsCount} Disbursed Vouchers
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Operating Income</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isProfitable ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
            }`}>
              {isProfitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-bold tracking-tight ${isProfitable ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {format(kpis.netProfit)}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                kpis.profitMargin >= 20 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {kpis.profitMargin}% Margin
              </span>
              <span className="text-[11px] text-slate-400">P&L Status</span>
            </div>
          </div>
        </div>

        {/* Estimated BIR Tax */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-400 dark:hover:border-purple-600 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Est. BIR 1701Q Tax (8%)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
              {format(kpis.estimatedTaxPayable)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Less: {format(kpis.totalCWT)} CWT (2307)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Row: Liquid Position & Tax Shield */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cash on Hand vs Bank */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-blue-300">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Cash on Hand (Debit)</p>
              <p className="text-lg font-bold">{format(kpis.cashOnHand)}</p>
            </div>
          </div>
          <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded text-slate-300 font-mono">CRJ Account 101</span>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-indigo-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-indigo-200">Cash in Bank (BPI / Deposits)</p>
              <p className="text-lg font-bold">{format(kpis.cashInBank)}</p>
            </div>
          </div>
          <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded text-indigo-200 font-mono">CRJ Account 102</span>
        </div>

        <div className="bg-gradient-to-r from-emerald-950 to-teal-900 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-200">Creditable Withholding Tax (CWT)</p>
              <p className="text-lg font-bold">{format(kpis.totalCWT)}</p>
            </div>
          </div>
          <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded text-emerald-200 font-mono">BIR Form 2307</span>
        </div>
      </div>
    </div>
  );
};
