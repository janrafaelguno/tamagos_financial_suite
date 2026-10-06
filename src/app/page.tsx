'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, TabType } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/DashboardView';
import { ReceiptsView } from '@/components/ReceiptsView';
import { DisbursementsView } from '@/components/DisbursementsView';
import { JournalView } from '@/components/JournalView';
import { TrialBalanceView } from '@/components/TrialBalanceView';
import { TaxCenterView } from '@/components/TaxCenterView';
import { MonthlySummaryView } from '@/components/MonthlySummaryView';
import { AuditLogView } from '@/components/AuditLogView';
import { Receipt, Disbursement, JournalEntry, Category } from '@/types/finance';

export default function FinanceCMS() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [currency, setCurrency] = useState<'PHP' | 'USD'>('PHP');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data states
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Quick action modal trigger states
  const [triggerNewReceipt, setTriggerNewReceipt] = useState(false);
  const [triggerNewDisbursement, setTriggerNewDisbursement] = useState(false);
  const [triggerNewJournal, setTriggerNewJournal] = useState(false);

  // Toggle dark mode class on document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Load all data
  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [recRes, disbRes, gjRes, analyticsRes] = await Promise.all([
        fetch(`/api/receipts`),
        fetch(`/api/disbursements`),
        fetch(`/api/journal`),
        fetch(`/api/analytics?year=${selectedYear}`)
      ]);

      const [recData, disbData, gjData, anData] = await Promise.all([
        recRes.json(),
        disbRes.json(),
        gjRes.json(),
        analyticsRes.json()
      ]);

      if (recData.success) setReceipts(recData.data || []);
      if (disbData.success) {
        setDisbursements(disbData.data || []);
        if (disbData.categories) setCategories(disbData.categories);
      }
      if (gjData.success) setJournalEntries(gjData.data || []);
      if (anData.success) setAnalytics(anData.data);
    } catch (err) {
      console.error('Failed to load financial records:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Receipts CRUD
  const handleAddReceipt = async (r: Omit<Receipt, 'id'>) => {
    const res = await fetch('/api/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r),
    });
    if (res.ok) await fetchData();
  };

  const handleUpdateReceipt = async (id: string, r: Partial<Receipt>) => {
    const res = await fetch(`/api/receipts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r),
    });
    if (res.ok) await fetchData();
  };

  const handleDeleteReceipt = async (id: string) => {
    const res = await fetch(`/api/receipts/${id}`, { method: 'DELETE' });
    if (res.ok) await fetchData();
  };

  // Disbursements CRUD
  const handleAddDisbursement = async (d: Omit<Disbursement, 'id'>) => {
    const res = await fetch('/api/disbursements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    if (res.ok) await fetchData();
  };

  const handleUpdateDisbursement = async (id: string, d: Partial<Disbursement>) => {
    const res = await fetch(`/api/disbursements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    if (res.ok) await fetchData();
  };

  const handleDeleteDisbursement = async (id: string) => {
    const res = await fetch(`/api/disbursements/${id}`, { method: 'DELETE' });
    if (res.ok) await fetchData();
  };

  // Journal CRUD
  const handleAddJournal = async (j: Omit<JournalEntry, 'id'>) => {
    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(j),
    });
    if (res.ok) await fetchData();
  };

  const handleDeleteJournal = async (id: string) => {
    const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' });
    if (res.ok) await fetchData();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      {/* CMS Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Main CMS Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenNewReceipt={() => {
            setActiveTab('receipts');
            setTriggerNewReceipt(true);
          }}
          onOpenNewDisbursement={() => {
            setActiveTab('disbursements');
            setTriggerNewDisbursement(true);
          }}
          onOpenNewJournal={() => {
            setActiveTab('journal');
            setTriggerNewJournal(true);
          }}
          onRefresh={fetchData}
          isRefreshing={isRefreshing}
        />

        {/* Tab Content Area */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-semibold text-slate-500">Connecting to Tamagos SQLite Database & Loading Financial Ledgers...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  kpis={analytics?.kpis || null}
                  monthlyData={analytics?.monthlyFinancials || []}
                  categoryBreakdown={analytics?.categoryBreakdown || []}
                  recentReceipts={receipts}
                  recentDisbursements={disbursements}
                  currency={currency}
                  selectedYear={selectedYear}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'receipts' && (
                <ReceiptsView
                  receipts={receipts}
                  currency={currency}
                  onAddReceipt={handleAddReceipt}
                  onUpdateReceipt={handleUpdateReceipt}
                  onDeleteReceipt={handleDeleteReceipt}
                />
              )}

              {activeTab === 'disbursements' && (
                <DisbursementsView
                  disbursements={disbursements}
                  categories={categories}
                  currency={currency}
                  onAddDisbursement={handleAddDisbursement}
                  onUpdateDisbursement={handleUpdateDisbursement}
                  onDeleteDisbursement={handleDeleteDisbursement}
                />
              )}

              {activeTab === 'journal' && (
                <JournalView
                  entries={journalEntries}
                  currency={currency}
                  onAddEntry={handleAddJournal}
                  onDeleteEntry={handleDeleteJournal}
                />
              )}

              {activeTab === 'trial-balance' && (
                <TrialBalanceView
                  trialBalance={analytics?.trialBalance || null}
                  currency={currency}
                />
              )}

              {activeTab === 'tax-center' && (
                <TaxCenterView
                  monthlyData={analytics?.monthlyFinancials || []}
                  kpis={analytics?.kpis || null}
                  currency={currency}
                  selectedYear={selectedYear}
                />
              )}

              {activeTab === 'monthly-summary' && (
                <MonthlySummaryView
                  monthlyData={analytics?.monthlyFinancials || []}
                  currency={currency}
                  selectedYear={selectedYear}
                />
              )}

              {activeTab === 'audit-log' && (
                <AuditLogView
                  logs={analytics?.auditLogs || []}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
