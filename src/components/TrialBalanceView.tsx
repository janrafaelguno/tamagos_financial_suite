'use client';

import React, { useState } from 'react';
import { TrialBalanceItem } from '@/types/finance';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Download, 
  BookOpen,
  ArrowRight,
  TrendingUp,
  Coins
} from 'lucide-react';

interface TrialBalanceViewProps {
  trialBalance: {
    accounts: TrialBalanceItem[];
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
    diff: number;
  } | null;
  currency: 'PHP' | 'USD';
}

export const TrialBalanceView: React.FC<TrialBalanceViewProps> = ({
  trialBalance,
  currency,
}) => {
  const sym = currency === 'PHP' ? '₱' : '$';
  const format = (n?: number) => `${sym}${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const [selectedAccount, setSelectedAccount] = useState<TrialBalanceItem | null>(null);

  if (!trialBalance) {
    return <div className="p-8 text-center text-slate-400">Loading Trial Balance ledger...</div>;
  }

  const { accounts, totalDebit, totalCredit, isBalanced, diff } = trialBalance;

  return (
    <div className="space-y-6">
      {/* Verification Status Banner */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs ${
        isBalanced 
          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
          : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
      }`}>
        <div className="flex items-center space-x-3.5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            isBalanced ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
          }`}>
            {isBalanced ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isBalanced ? 'Trial Balance Verified & In Equilibrium' : 'Trial Balance Variance Detected'}
              </h3>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                isBalanced 
                  ? 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' 
                  : 'bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
              }`}>
                {isBalanced ? 'Balanced' : `Variance: ${format(diff)}`}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              {isBalanced 
                ? 'Total debits exactly match total credits across all asset, liability, equity, and expense accounts.'
                : 'Your Google Sheet noted "NOT BALANCE 9/20". The CMS automatically identifies and tracks ledger balancing.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total Debits</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{format(totalDebit)}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total Credits</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{format(totalCredit)}</span>
          </div>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tamagos Chart of Accounts & General Ledger</h3>
            <p className="text-xs text-slate-500">Summary of all debit and credit account balances</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print Trial Balance</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Account Code</th>
                <th className="py-3 px-4">Account Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Debit Balance</th>
                <th className="py-3 px-4 text-right">Credit Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {accounts.map((a) => (
                <tr 
                  key={a.account_code} 
                  onClick={() => setSelectedAccount(a)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                    {a.account_code}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {a.account_title}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      a.category === 'Asset' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      a.category === 'Revenue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      a.category === 'Expense' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    }`}>
                      {a.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {a.debit_balance > 0 ? format(a.debit_balance) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {a.credit_balance > 0 ? format(a.credit_balance) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
              <tr>
                <td colSpan={3} className="py-3.5 px-4 uppercase text-right tracking-wider">
                  Total Ledger Sum
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-indigo-600 dark:text-indigo-400">
                  {format(totalDebit)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-900 dark:text-white">
                  {format(totalCredit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Account Info Modal / Drawer */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">Account {selectedAccount.account_code}</span>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">{selectedAccount.account_title}</h4>
              </div>
              <button 
                onClick={() => setSelectedAccount(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Account Classification:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedAccount.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Debit Balance:</span>
                <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{format(selectedAccount.debit_balance)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Credit Balance:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{format(selectedAccount.credit_balance)}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300">
              <p className="font-semibold">General Ledger Integration</p>
              <p className="text-[11px] mt-0.5">
                Balances are recalculated dynamically on every receipt, disbursement, or adjusting journal entry to guarantee zero reconciliation drift.
              </p>
            </div>

            <div className="text-right">
              <button
                onClick={() => setSelectedAccount(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
