'use client';

import React from 'react';
import { MonthlySummary } from '@/types/finance';
import { 
  CalendarDays, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Percent, 
  Coins,
  Receipt,
  Wallet
} from 'lucide-react';

interface MonthlySummaryViewProps {
  monthlyData: MonthlySummary[];
  currency: 'PHP' | 'USD';
  selectedYear: number;
}

export const MonthlySummaryView: React.FC<MonthlySummaryViewProps> = ({
  monthlyData,
  currency,
  selectedYear,
}) => {
  const sym = currency === 'PHP' ? '₱' : '$';
  const format = (n?: number) => `${sym}${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalSales = monthlyData.reduce((acc, m) => acc + m.gross_sales, 0);
  const totalExpenses = monthlyData.reduce((acc, m) => acc + m.total_expenses, 0);
  const totalNet = totalSales - totalExpenses;
  const totalCwt = monthlyData.reduce((acc, m) => acc + m.cwt, 0);
  const totalTaxPayable = monthlyData.reduce((acc, m) => acc + m.tax_payable, 0);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Annual Gross Revenue</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{format(totalSales)}</p>
          <span className="text-[10px] text-slate-400">Total Fiscal Year {selectedYear}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Annual Disbursements</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{format(totalExpenses)}</p>
          <span className="text-[10px] text-slate-400">Operating Outflow</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Net Annual Income</p>
          <p className={`text-xl font-bold mt-1 ${totalNet >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {format(totalNet)}
          </p>
          <span className="text-[10px] text-slate-400">
            {totalSales > 0 ? `${((totalNet / totalSales) * 100).toFixed(1)}% Net Margin` : '0%'}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Annual CWT Credit (2307)</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{format(totalCwt)}</p>
          <span className="text-[10px] text-slate-400">Tax Withheld by Clients</span>
        </div>
      </div>

      {/* Monthly Comparative Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Month-by-Month Financial Performance & Tax Accrual (FY {selectedYear})
            </h3>
            <p className="text-xs text-slate-500">Breakdown of sales, expenses, cash distributions, and net margins</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4 text-right">Debit Cash on Hand</th>
                <th className="py-3 px-4 text-right">Debit Cash in Bank</th>
                <th className="py-3 px-4 text-right">Debit CWT (2307)</th>
                <th className="py-3 px-4 text-right">Credit Sales (CRJ)</th>
                <th className="py-3 px-4 text-right">Disbursements (CDJ)</th>
                <th className="py-3 px-4 text-right">Net Income</th>
                <th className="py-3 px-4 text-right">Est. Tax (8%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {monthlyData.map((m) => {
                const isPositive = m.net_income >= 0;
                return (
                  <tr key={m.month} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {m.month_name} {selectedYear}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {m.cash_on_hand > 0 ? format(m.cash_on_hand) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {m.cash_in_bank > 0 ? format(m.cash_in_bank) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-purple-600 dark:text-purple-400 whitespace-nowrap">
                      {m.cwt > 0 ? format(m.cwt) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {m.gross_sales > 0 ? format(m.gross_sales) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      {m.total_expenses > 0 ? format(m.total_expenses) : '—'}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                      isPositive ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {format(m.net_income)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {m.tax_payable > 0 ? format(m.tax_payable) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
              <tr>
                <td className="py-3.5 px-4 uppercase tracking-wider">Total Year-to-Date</td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-800 dark:text-slate-200">
                  {format(monthlyData.reduce((acc, m) => acc + m.cash_on_hand, 0))}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-800 dark:text-slate-200">
                  {format(monthlyData.reduce((acc, m) => acc + m.cash_in_bank, 0))}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-purple-600 dark:text-purple-400">
                  {format(totalCwt)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                  {format(totalSales)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-600 dark:text-amber-400">
                  {format(totalExpenses)}
                </td>
                <td className={`py-3.5 px-4 text-right font-mono ${totalNet >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'}`}>
                  {format(totalNet)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-900 dark:text-white">
                  {format(totalTaxPayable)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
