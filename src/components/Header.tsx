'use client';

import React, { useState } from 'react';
import { TabType } from './Sidebar';
import { 
  Plus, 
  Download, 
  Search, 
  Calendar, 
  ReceiptText, 
  WalletCards, 
  BookOpen, 
  ChevronDown,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenNewReceipt: () => void;
  onOpenNewDisbursement: () => void;
  onOpenNewJournal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const titles: Record<TabType, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Executive Financial Dashboard',
    subtitle: 'Real-time financial performance, cash reserves, and profit analytics',
  },
  receipts: {
    title: 'Cash Receipts Journal (CRJ)',
    subtitle: 'Sales invoices, collections, cash vs bank deposits, and 2307 CWT withholdings',
  },
  disbursements: {
    title: 'Cash Disbursements Journal (CDJ)',
    subtitle: 'Operational expenditures, fuel, labor, tollway fees, and vendor vouchers',
  },
  journal: {
    title: 'General Journal (GJ)',
    subtitle: 'Double-entry transfers, ATM cash withdrawals, owner drawings, and bank fees',
  },
  'trial-balance': {
    title: 'General Ledger & Trial Balance',
    subtitle: 'Automated trial balance verification with zero reconciliation discrepancy',
  },
  'tax-center': {
    title: 'BIR 1701Q Quarterly Tax Center',
    subtitle: 'Philippine 8% Gross Income Tax calculator, ₱250k deduction, and Form 2307 credits',
  },
  'monthly-summary': {
    title: 'Monthly Summary & Profit / Loss',
    subtitle: 'Comprehensive monthly income, category-by-category expense audit, and margins',
  },
  'audit-log': {
    title: 'Audit Trail & Change History',
    subtitle: 'Tamagos CMS transaction logs, automated backups, and modification history',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  selectedYear,
  setSelectedYear,
  searchQuery,
  setSearchQuery,
  onOpenNewReceipt,
  onOpenNewDisbursement,
  onOpenNewJournal,
  onRefresh,
  isRefreshing,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { title, subtitle } = titles[activeTab];

  const handleExport = (type: 'receipts' | 'disbursements' | 'journal') => {
    window.open(`/api/export?type=${type}`, '_blank');
    setShowExportMenu(false);
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-20 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[200px] lg:min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </div>

          {/* Year Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 shrink-0" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer pr-1"
            >
              <option value={2026}>FY 2026</option>
              <option value={2025}>FY 2025</option>
              <option value={2024}>FY 2024</option>
            </select>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showExportMenu && (
              <div 
                className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 text-xs animate-in fade-in slide-in-from-top-1"
                onMouseLeave={() => setShowExportMenu(false)}
              >
                <button
                  onClick={() => handleExport('receipts')}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <ReceiptText className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Export Receipts (CRJ)</span>
                </button>
                <button
                  onClick={() => handleExport('disbursements')}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <WalletCards className="w-3.5 h-3.5 text-amber-500" />
                  <span>Export Disbursements (CDJ)</span>
                </button>
                <button
                  onClick={() => handleExport('journal')}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Export General Journal (GJ)</span>
                </button>
              </div>
            )}
          </div>

          {/* New Transaction Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>New Entry</span>
              <ChevronDown className="w-3 h-3 text-blue-200" />
            </button>

            {showAddMenu && (
              <div 
                className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1"
                onMouseLeave={() => setShowAddMenu(false)}
              >
                <div className="px-3 py-1 font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
                  Select Entry Type
                </div>
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    onOpenNewReceipt();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5 transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <ReceiptText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium">Sales Receipt</p>
                    <p className="text-[10px] text-slate-400">Add to Cash Receipts</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    onOpenNewDisbursement();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-900/40 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-2.5 transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <WalletCards className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium">Expense Voucher</p>
                    <p className="text-[10px] text-slate-400">Log Cash Disbursement</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    onOpenNewJournal();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2.5 transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-medium">Journal Entry</p>
                    <p className="text-[10px] text-slate-400">Transfer or Owner Drawing</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
