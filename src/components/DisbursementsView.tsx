'use client';

import React, { useState, useMemo } from 'react';
import { Disbursement, Category } from '@/types/finance';
import { 
  Plus, 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Tag, 
  WalletCards,
  Fuel,
  Wrench,
  Car,
  Receipt,
  Utensils,
  PhoneCall,
  Percent,
  Filter
} from 'lucide-react';

interface DisbursementsViewProps {
  disbursements: Disbursement[];
  categories: Category[];
  currency: 'PHP' | 'USD';
  onAddDisbursement: (d: Omit<Disbursement, 'id'>) => Promise<void>;
  onUpdateDisbursement: (id: string, d: Partial<Disbursement>) => Promise<void>;
  onDeleteDisbursement: (id: string) => Promise<void>;
}

export const DisbursementsView: React.FC<DisbursementsViewProps> = ({
  disbursements,
  categories,
  currency,
  onAddDisbursement,
  onUpdateDisbursement,
  onDeleteDisbursement,
}) => {
  const sym = currency === 'PHP' ? '₱' : '$';
  const format = (n?: number) => `${sym}${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDisbursement, setEditingDisbursement] = useState<Disbursement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [particulars, setParticulars] = useState('');
  const [refNo, setRefNo] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState('Cost of Service');
  const [paymentMethod, setPaymentMethod] = useState<Disbursement['payment_method']>('Cash on Hand');
  const [status, setStatus] = useState<Disbursement['status']>('Paid');
  const [notes, setNotes] = useState('');

  // Frequent expense quick presets
  const quickPresets = [
    { label: '⛽ Diesel Purchase (₱1,000)', cat: 'Gasoline & Diesel', amt: 1000, desc: 'Petron Diesel Purchase' },
    { label: '🛠️ Labor Cost (₱2,000)', cat: 'Cost of Service', amt: 2000, desc: 'Labor Cost (Farson / Technicians)' },
    { label: '🛣️ NLEX / Skyway Toll (₱100)', cat: 'Transportation & Tolls', amt: 100, desc: 'NLEX / Skyway Tollway' },
    { label: '🍱 Meal Allowance (₱300)', cat: 'Travel & Meal Expenses', amt: 300, desc: 'Meal Allowance' },
    { label: '🤝 Commission (₱1,500)', cat: 'Commission Expense', amt: 1500, desc: 'Commission Expense' },
  ];

  const filteredDisbursements = useMemo(() => {
    return disbursements.filter(d => {
      const matchSearch = 
        d.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.ref_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'All' || d.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [disbursements, searchTerm, categoryFilter]);

  const totalFilteredAmount = useMemo(() => {
    return filteredDisbursements.reduce((acc, d) => acc + d.amount, 0);
  }, [filteredDisbursements]);

  const openAddModal = () => {
    setEditingDisbursement(null);
    setDate(new Date().toISOString().split('T')[0]);
    setParticulars('');
    setRefNo('');
    setAmount('');
    setCategory('Cost of Service');
    setPaymentMethod('Cash on Hand');
    setStatus('Paid');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (d: Disbursement) => {
    setEditingDisbursement(d);
    setDate(d.date);
    setParticulars(d.particulars);
    setRefNo(d.ref_no || '');
    setAmount(d.amount);
    setCategory(d.category);
    setPaymentMethod(d.payment_method);
    setStatus(d.status);
    setNotes(d.notes || '');
    setIsModalOpen(true);
  };

  const applyPreset = (preset: typeof quickPresets[0]) => {
    setCategory(preset.cat);
    setAmount(preset.amt);
    setParticulars(preset.desc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!particulars || !date || amount === '') return;
    setIsSubmitting(true);

    const data = {
      date,
      particulars,
      ref_no: refNo,
      amount: Number(amount),
      category,
      payment_method: paymentMethod,
      status,
      notes,
    };

    try {
      if (editingDisbursement) {
        await onUpdateDisbursement(editingDisbursement.id, data);
      } else {
        await onAddDisbursement(data);
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (catName: string) => {
    switch (catName) {
      case 'Cost of Service': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300';
      case 'Gasoline & Diesel': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300';
      case 'Travel & Meal Expenses': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300';
      case 'Transportation & Tolls': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/60 dark:text-pink-300';
      case 'Commission Expense': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300';
      case 'Supplies Expense': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300';
      case 'Accounts Payable': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Filtered Disbursements</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{format(totalFilteredAmount)}</p>
          <span className="text-[10px] text-slate-400">Total of {filteredDisbursements.length} filtered vouchers</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Active Expense Categories</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{categories.length} Categories</p>
          <span className="text-[10px] text-emerald-600 font-medium">Includes Commission & Tollway feeds</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Payment Outflow Mode</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">Petty Cash & Bank</p>
          <span className="text-[10px] text-slate-400">Reconciled against Credit Cash on Hand</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendor, voucher #, item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 border border-transparent dark:border-slate-700 text-xs font-medium focus:outline-hidden"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredDisbursements.length}</span> entries
            </span>
            <button
              onClick={openAddModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Particulars / Vendor</th>
                <th className="py-3 px-4">Ref No.</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Credit Cash / Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDisbursements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No disbursement records match your filter.
                  </td>
                </tr>
              ) : (
                filteredDisbursements.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {d.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {d.particulars}
                      {d.notes && <p className="text-[10px] text-slate-400 font-normal">{d.notes}</p>}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {d.ref_no ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {d.ref_no}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${getCategoryColor(d.category)}`}>
                        {d.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {d.payment_method}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      {format(d.amount)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        d.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {d.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditModal(d)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Disbursement"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete disbursement ${d.particulars}?`)) {
                              onDeleteDisbursement(d.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Disbursement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Disbursement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden text-xs">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingDisbursement ? 'Edit Disbursement Voucher' : 'Log Cash Disbursement (CDJ)'}
                </h3>
                <p className="text-[11px] text-slate-500">Record cash outflow, petty cash, labor, or parts purchase</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Quick Presets */}
              {!editingDisbursement && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Quick Expense Presets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPresets.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Voucher Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Voucher / Ref No.</label>
                  <input
                    type="text"
                    placeholder="e.g. PCV-041, SI 0670, DR 3656"
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Particulars / Vendor / Purpose *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Petron - Diesel Fuel purchase"
                  value={particulars}
                  onChange={(e) => setParticulars(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Expense Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Amount ({sym}) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm text-amber-600 dark:text-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Cash on Hand">Cash on Hand (Petty Cash)</option>
                    <option value="Bank Transfer">Bank Transfer (BPI / Wire)</option>
                    <option value="GCash">GCash / Digital Wallet</option>
                    <option value="Check">Check Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Paid">Paid / Settled</option>
                    <option value="Pending">Pending Reimbursement</option>
                    <option value="Reimbursed">Reimbursed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional details, job reference or receipt remarks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
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
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Saving...' : editingDisbursement ? 'Update Voucher' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
