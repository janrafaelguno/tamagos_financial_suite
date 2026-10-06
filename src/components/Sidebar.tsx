'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  WalletCards, 
  BookOpen, 
  Scale, 
  FileSpreadsheet, 
  CalendarDays, 
  ShieldCheck, 
  ChevronRight,
  Sun,
  Moon,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export type TabType = 
  | 'dashboard'
  | 'receipts'
  | 'disbursements'
  | 'journal'
  | 'trial-balance'
  | 'tax-center'
  | 'monthly-summary'
  | 'audit-log';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currency: 'PHP' | 'USD';
  setCurrency: (c: 'PHP' | 'USD') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  isDark,
  setIsDark,
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      badge: 'Overview',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    },
    {
      id: 'receipts' as TabType,
      label: 'Cash Receipts (CRJ)',
      icon: ReceiptText,
      badge: 'Sales & Invoices',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    },
    {
      id: 'disbursements' as TabType,
      label: 'Disbursements (CDJ)',
      icon: WalletCards,
      badge: 'Expenses',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    },
    {
      id: 'journal' as TabType,
      label: 'General Journal (GJ)',
      icon: BookOpen,
      badge: 'Transfers',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
    },
    {
      id: 'trial-balance' as TabType,
      label: 'Ledger & Trial Balance',
      icon: Scale,
      badge: 'Auto-Balancing',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
    },
    {
      id: 'tax-center' as TabType,
      label: 'BIR 1701Q Tax Center',
      icon: FileSpreadsheet,
      badge: '8% / 2307 CWT',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
    },
    {
      id: 'monthly-summary' as TabType,
      label: 'Monthly Summaries',
      icon: CalendarDays,
      badge: 'P&L Reports',
      badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300'
    },
    {
      id: 'audit-log' as TabType,
      label: 'Audit & Activity Log',
      icon: ShieldCheck,
      badge: 'History',
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm z-30 transition-colors">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">Tamagos</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">CMS</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Financial Suite</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Finance Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ml-1.5 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
        {/* Currency & Dark Mode Toggles */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setCurrency('PHP')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                currency === 'PHP'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              ₱ PHP
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                currency === 'USD'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              $ USD
            </button>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-xs"
            title="Toggle Dark / Light Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            <span className="text-[11px] font-medium">{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        {/* User / Org badge */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
              TM
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Finance Dept</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live SQLite
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">v2.6</span>
        </div>
      </div>
    </aside>
  );
};
