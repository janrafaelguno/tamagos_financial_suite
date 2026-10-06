'use client';

import React, { useState, useMemo } from 'react';
import { JournalEntry } from '@/types/finance';
import { 
  Plus, 
  Search, 
  Trash2, 
  BookOpen, 
  ArrowRightLeft, 
  UserMinus, 
  Percent, 
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface JournalViewProps {
  entries: JournalEntry[];
  currency: 'PHP' | 'USD';
  onAddEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

export const JournalView: React.FC<JournalViewProps> = ({
  entries,
  currency,
  onAddEntry,
  onDeleteEntry,
}) => {
  const sym = currency === 'PHP' ? '₱' : '$';
  const format = (n?: number) => `${sym}${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [narration, setNarration] = useState('');
  const [refNo, setRefNo] = useState('');
  const [debit, setDebit] = useState<number | ''>('');
  const [credit, setCredit] = useState<number | ''>('');
  const [entryType, setEntryType] = useState<JournalEntry['entry_type']>('Bank Transfer');

  const presets = [
    {
      title: 'InstaPay Transfer Fee (₱10)',
      type: 'Bank Fee' as const,
      debit: 10,
      credit: 10,
      narration: 'Insta Pay Transfer Fee\nCash In Bank\nTo Record Insta Pay Transfer Fee',
    },
    {
      title: 'ATM Cash Withdrawal (₱10,000)',
      type: 'Bank Transfer' as const,
      debit: 10000,
      credit: 10000,
      narration: 'Cash on Hand\nCash in Bank\nTo Record ATM Withdrawal to Petty Cash',
    },
    {
      title: "Owner's Personal Withdrawal (₱5,000)",
      type: 'Owner Drawing / ATM' as const,
      debit: 5000,
      credit: 5000,
      narration: "Owner's Withdrawal\nCash In Bank\nTo Record Owner's Personal Drawings",
    },
    {
      title: 'Encashment Fee (₱100)',
      type: 'Bank Fee' as const,
      debit: 100,
      credit: 100,
      narration: 'Encashment Fee\nCash on Hand\nTo Record Encashment Fee of the Day',
    },
  ];

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchSearch = 
        e.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.ref_no || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === 'All' || e.entry_type === typeFilter;
      return matchSearch && matchType;
    });
  }, [entries, searchTerm, typeFilter]);

  const totals = useMemo(() => {
    return filteredEntries.reduce((acc, e) => ({
      debit: acc.debit + e.debit,
      credit: acc.credit + e.credit,
    }), { debit: 0, credit: 0 });
  }, [filteredEntries]);

  const applyPreset = (p: typeof presets[0]) => {
    setEntryType(p.type);
    setDebit(p.debit);
    setCredit(p.credit);
    setNarration(p.narration);
  };

  const openAddModal = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setNarration('');
    setRefNo('');
    setDebit('');
    setCredit('');
    setEntryType('Bank Transfer');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narration || !date) return;
    setIsSubmitting(true);

    try {
      await onAddEntry({
        date,
        narration,
        ref_no: refNo,
        debit: Number(debit) || 0,
        credit: Number(credit) || 0,
        entry_type: entryType,
      });
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Journal Debits</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{format(totals.debit)}</p>
          <span className="text-[10px] text-slate-400">Total debited movements</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Journal Credits</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{format(totals.credit)}</p>
          <span className="text-[10px] text-slate-400">Total credited movements</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Double-Entry Status</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Balanced Entries
            </p>
            <span className="text-[10px] text-slate-400">{filteredEntries.length} General Journal Records</span>
          </div>
          <button
            onClick={openAddModal}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New GJ Entry</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search narration or transfer details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 border border-transparent dark:border-slate-700 text-xs font-medium focus:outline-hidden"
            >
              <option value="All">All Entry Types</option>
              <option value="Bank Transfer">Bank Transfers</option>
              <option value="Owner Drawing / ATM">Owner Drawings / ATM</option>
              <option value="Bank Fee">Bank Fees</option>
              <option value="Adjustment">Adjustments</option>
              <option value="General">General</option>
            </select>
          </div>

          <span className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredEntries.length}</span> entries
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Particulars / Journal Narration</th>
                <th className="py-3 px-4">Ref No.</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Debit</th>
                <th className="py-3 px-4 text-right">Credit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No journal entries found.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {j.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-900 dark:text-slate-100 font-medium whitespace-pre-line leading-relaxed max-w-md">
                        {j.narration}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {j.ref_no ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                          {j.ref_no}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        j.entry_type === 'Bank Fee'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                          : j.entry_type === 'Owner Drawing / ATM'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300'
                      }`}>
                        {j.entry_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {j.debit > 0 ? format(j.debit) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {j.credit > 0 ? format(j.credit) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (confirm('Delete this journal entry?')) {
                            onDeleteEntry(j.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden text-xs">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Record General Journal Entry (GJ)
                </h3>
                <p className="text-[11px] text-slate-500">Record bank transfer, ATM withdrawal, or fee adjustment</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Presets */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Common Journal Templates
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {presets.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="text-left p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <p className="font-semibold text-[11px]">{p.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{p.type}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Entry Classification</label>
                  <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Owner Drawing / ATM">Owner Drawing / ATM</option>
                    <option value="Bank Fee">Bank Fee (InstaPay / Encashment)</option>
                    <option value="Adjustment">Adjustment / Rectification</option>
                    <option value="General">General Journal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Journal Particulars / Narration *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Debit Account&#10;Credit Account&#10;To Record..."
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Debit Amount ({sym}) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={debit}
                    onChange={(e) => {
                      const v = e.target.value === '' ? '' : Number(e.target.value);
                      setDebit(v);
                      if (credit === '' || credit === 0) setCredit(v);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm text-indigo-600 dark:text-indigo-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-700 dark:text-slate-300">Credit Amount ({sym}) *</label>
                    <button
                      type="button"
                      onClick={() => setCredit(debit)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Match Debit
                    </button>
                  </div>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={credit}
                    onChange={(e) => setCredit(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Recording...' : 'Record Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
