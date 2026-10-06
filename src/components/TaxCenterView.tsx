'use client';

import React, { useState } from 'react';
import { MonthlySummary, FinancialKPIs } from '@/types/finance';
import { 
  FileSpreadsheet, 
  Download, 
  HelpCircle, 
  Percent, 
  ShieldCheck, 
  AlertCircle, 
  Coins,
  CheckCircle2,
  Calendar,
  Building
} from 'lucide-react';

interface TaxCenterViewProps {
  monthlyData: MonthlySummary[];
  kpis: FinancialKPIs | null;
  currency: 'PHP' | 'USD';
  selectedYear: number;
}

export const TaxCenterView: React.FC<TaxCenterViewProps> = ({
  monthlyData,
  kpis,
  currency,
  selectedYear,
}) => {
  const sym = currency === 'PHP' ? '₱' : '$';
  const format = (n?: number) => `${sym}${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const [taxRegime, setTaxRegime] = useState<'8_percent' | 'graduated'>('8_percent');
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(1);

  // Calculate quarters
  const q1Months = monthlyData.slice(0, 3);
  const q2Months = monthlyData.slice(3, 6);
  const q3Months = monthlyData.slice(6, 9);
  const q4Months = monthlyData.slice(9, 12);

  const getQuarterData = (months: MonthlySummary[]) => {
    return months.reduce((acc, m) => ({
      sales: acc.sales + m.gross_sales,
      expenses: acc.expenses + m.total_expenses,
      cwt: acc.cwt + m.cwt,
      cash: acc.cash + m.cash_on_hand,
      bank: acc.bank + m.cash_in_bank,
    }), { sales: 0, expenses: 0, cwt: 0, cash: 0, bank: 0 });
  };

  const q1 = getQuarterData(q1Months);
  const q2 = getQuarterData(q2Months);
  const q3 = getQuarterData(q3Months);
  const q4 = getQuarterData(q4Months);

  // BIR 1701Q Cumulative calculation logic (TRAIN Law)
  // Q1: Sales - ₱250k deduction -> Taxable * 8% - Q1 CWT = Net Tax Due
  // Q2: (Q1+Q2 Sales) - ₱250k deduction -> Taxable * 8% - (Q1+Q2 CWT) - Q1 Tax Paid = Net Tax Due
  // Q3: (Q1+Q2+Q3 Sales) - ₱250k deduction -> Taxable * 8% - (Cumulative CWT) - Prior Taxes Paid = Net Tax Due
  const q1Deduction = 250000;
  const q1Taxable = Math.max(0, q1.sales - q1Deduction);
  const q1TaxDue = q1Taxable * 0.08;
  const q1NetPayable = Math.max(0, q1TaxDue - q1.cwt);

  const q2CumSales = q1.sales + q2.sales;
  const q2CumTaxable = Math.max(0, q2CumSales - q1Deduction);
  const q2CumTaxDue = q2CumTaxable * 0.08;
  const q2CumCwt = q1.cwt + q2.cwt;
  const q2NetPayable = Math.max(0, q2CumTaxDue - q2CumCwt - q1NetPayable);

  const q3CumSales = q2CumSales + q3.sales;
  const q3CumTaxable = Math.max(0, q3CumSales - q1Deduction);
  const q3CumTaxDue = q3CumTaxable * 0.08;
  const q3CumCwt = q2CumCwt + q3.cwt;
  const q3NetPayable = Math.max(0, q3CumTaxDue - q3CumCwt - (q1NetPayable + q2NetPayable));

  const q4CumSales = q3CumSales + q4.sales;
  const q4CumTaxable = Math.max(0, q4CumSales - q1Deduction);
  const q4CumTaxDue = q4CumTaxable * 0.08;
  const q4CumCwt = q3CumCwt + q4.cwt;
  const q4NetPayable = Math.max(0, q4CumTaxDue - q4CumCwt - (q1NetPayable + q2NetPayable + q3NetPayable));

  const quarters = [
    { q: 1, name: 'Q1 (Jan - Mar)', deadline: `May 15, ${selectedYear}`, sales: q1.sales, deduction: q1Deduction, taxable: q1Taxable, taxDue: q1TaxDue, cwt: q1.cwt, netPayable: q1NetPayable },
    { q: 2, name: 'Q2 (Apr - Jun)', deadline: `Aug 15, ${selectedYear}`, sales: q2.sales, deduction: 0, taxable: q2.sales, taxDue: q2.sales * 0.08, cwt: q2.cwt, netPayable: q2NetPayable },
    { q: 3, name: 'Q3 (Jul - Sep)', deadline: `Nov 15, ${selectedYear}`, sales: q3.sales, deduction: 0, taxable: q3.sales, taxDue: q3.sales * 0.08, cwt: q3.cwt, netPayable: q3NetPayable },
    { q: 4, name: 'Q4 / Annual (Oct - Dec)', deadline: `Apr 15, ${selectedYear + 1}`, sales: q4.sales, deduction: 0, taxable: q4.sales, taxDue: q4.sales * 0.08, cwt: q4.cwt, netPayable: q4NetPayable },
  ];

  const activeQ = quarters[selectedQuarter - 1];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-rose-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase tracking-wider">
                Philippine BIR Form 1701Q
              </span>
              <span className="text-xs text-slate-300 font-mono">TRAIN Law Sec. 24(A)(2)(b)</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight mt-1">Quarterly Income Tax Return Assistant</h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Automated BIR 1701Q computation based on your Cash Receipts Journal. Solves spreadsheet note: 
              <span className="italic text-rose-200"> "250000 is only allow once a year but encoded in every fillings of 1701q"</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print Tax Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quarter Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quarters.map((quarter) => {
          const isSelected = selectedQuarter === quarter.q;
          return (
            <button
              key={quarter.q}
              onClick={() => setSelectedQuarter(quarter.q as any)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 dark:border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">{quarter.name}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  1701Q
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Due: {quarter.deadline}</p>
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400">Quarter Sales</p>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{format(quarter.sales)}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Form 1701Q Computation Sheet */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Official BIR Form 1701Q Computation: {activeQ.name}
            </h3>
            <p className="text-xs text-slate-500">Tax Year {selectedYear} • Filing Deadline: {activeQ.deadline}</p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500">Tax Regime:</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
              8% Gross Income Tax (Option 2)
            </span>
          </div>
        </div>

        {/* Breakdown Breakdown Line Items */}
        <div className="p-6 space-y-4 max-w-3xl text-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Line 36: Gross Sales / Receipts from CRJ</span>
                <p className="text-[11px] text-slate-400">Total service revenues recorded in Cash Receipts Journal</p>
              </div>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{format(activeQ.sales)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 px-3 rounded-lg">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Line 38: Less: Allowable Reduction under TRAIN Law</span>
                <p className="text-[11px] text-slate-400">
                  {selectedQuarter === 1 
                    ? '₱250,000.00 standard annual exemption applied for Q1' 
                    : 'Exemption already applied in full in Q1 (0 allowable in subsequent quarters)'}
                </p>
              </div>
              <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                - {format(activeQ.deduction)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 font-bold">
              <div>
                <span className="text-slate-900 dark:text-white">Line 39: Taxable Income Subject to 8%</span>
                <p className="text-[11px] text-slate-400 font-normal">Gross Sales less Allowable Deductions</p>
              </div>
              <span className="font-mono text-sm text-slate-900 dark:text-white">{format(activeQ.taxable)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Line 40: Tax Due (8% of Taxable Income)</span>
                <p className="text-[11px] text-slate-400">8% flat rate applied to Line 39</p>
              </div>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{format(activeQ.taxDue)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 bg-purple-50/50 dark:bg-purple-950/20 px-3 rounded-lg">
              <div>
                <span className="font-semibold text-purple-900 dark:text-purple-300">
                  Line 42: Less: Creditable Withholding Tax (BIR Form 2307)
                </span>
                <p className="text-[11px] text-purple-700 dark:text-purple-400">
                  Total 2% tax withheld by clients (Jubillee, Synergy, Pristine, etc.) as recorded in CRJ
                </p>
              </div>
              <span className="font-mono font-bold text-sm text-purple-600 dark:text-purple-400">
                - {format(activeQ.cwt)}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 bg-slate-900 dark:bg-slate-950 text-white px-4 rounded-xl shadow-sm">
              <div>
                <span className="font-bold text-sm">Line 45: Net Tax Payable to BIR</span>
                <p className="text-[11px] text-slate-400">Actual amount to pay via Authorized Agent Bank (AAB) or eFPS</p>
              </div>
              <span className="font-mono font-bold text-lg text-emerald-400">
                {format(activeQ.netPayable)}
              </span>
            </div>
          </div>

          {/* Form 2307 Certificate Checklist */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 mt-4">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Required BIR Filing Attachments
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside">
              <li>BIR Form 2307 (Certificate of Creditable Tax Withheld at Source) from all clients</li>
              <li>Summary Alphalist of Withholding Tax Agents of Income Payments (SAWT)</li>
              <li>Proof of Payment (AAB validated deposit slip or eFPS / Maya / GCash BIR confirmation)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
