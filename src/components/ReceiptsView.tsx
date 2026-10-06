'use client';

import React, { useState, useMemo } from 'react';
import { Receipt } from '@/types/finance';
import { 
  Plus, 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileSpreadsheet,
  Building,
  CreditCard,
  Coins,
  ReceiptText,
  Filter
} from 'lucide-react';

interface ReceiptsViewProps {
  receipts: Receipt[];
  currency: 'PHP' | 'USD';
  onAddReceipt: (r: Omit<Receipt, 'id'>) => Promise<void>;
  onUpdateReceipt: (id: string, r: Partial<Receipt>) => Promise<void>;
  onDeleteReceipt: (id: string) => Promise<void>;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
  receipts,
  currency,
  onAddReceipt,
  onUpdateReceipt,
  onDeleteReceipt,
}) => {
  const sym = currency === 'PHP' ? '₱' : '$';
  const format = (n?: number) => `${sym}${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [salesAmount, setSalesAmount] = useState<number | ''>('');
  const [cashOnHand, setCashOnHand] = useState<number | ''>('');
  const [cashInBank, setCashInBank] = useState<number | ''>('');
  const [cwt, setCwt] = useState<number | ''>('');
  const [status, setStatus] = useState<Receipt['status']>('Paid');

  // Frequent client suggestions
  const topClients = [
    'Jubillee Commerce & Trucking Inc.',
    'Synergy Sales International Corp.',
    'Pristine Energy Transfer Corp.',
    'Menorian Freight Forwarder',
    'ANCO Movers Corp.',
    'RAD Trucking Services',
    'Centaur Chem Enterprises',
    'LBC Express Inc.'
  ];

  // Filtering
  const filteredReceipts = useMemo(() => {
    return receipts.filter(r => {
      const matchSearch = 
        r.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.invoice_no || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [receipts, searchTerm, statusFilter]);

  // Aggregate totals
  const totals = useMemo(() => {
    return filteredReceipts.reduce((acc, r) => ({
      sales: acc.sales + r.sales_amount,
      cash: acc.cash + r.cash_on_hand,
      bank: acc.bank + r.cash_in_bank,
      cwt: acc.cwt + r.cwt,
    }), { sales: 0, cash: 0, bank: 0, cwt: 0 });
  }, [filteredReceipts]);

  const openAddModal = () => {
    setEditingReceipt(null);
    setDate(new Date().toISOString().split('T')[0]);
    setClient('');
    setDescription('');
    setInvoiceNo('');
    setSalesAmount('');
    setCashOnHand('');
    setCashInBank('');
    setCwt('');
    setStatus('Paid');
    setIsModalOpen(true);
  };

  const openEditModal = (r: Receipt) => {
    setEditingReceipt(r);
    setDate(r.date);
    setClient(r.client);
    setDescription(r.description || '');
    setInvoiceNo(r.invoice_no || '');
    setSalesAmount(r.sales_amount);
    setCashOnHand(r.cash_on_hand);
    setCashInBank(r.cash_in_bank);
    setCwt(r.cwt);
    setStatus(r.status);
    setIsModalOpen(true);
  };

  const handleAutoCalcCWT = () => {
    const s = Number(salesAmount) || 0;
    if (s <= 0) return;
    const computedCwt = Math.round(s * 0.02 * 100) / 100; // 2% CWT
    const netPayable = s - computedCwt;
    setCwt(computedCwt);
    // Default remainder to Bank or Cash
    if (cashInBank !== '' && Number(cashInBank) > 0) {
      setCashInBank(netPayable);
    } else {
      setCashOnHand(netPayable);
    }
  };

  const handleDepositSplit = (type: 'all-cash' | 'all-bank' | 'split-5050') => {
    const s = Number(salesAmount) || 0;
    const c = Number(cwt) || 0;
    const net = Math.max(0, s - c);

    if (type === 'all-cash') {
      setCashOnHand(net);
      setCashInBank(0);
    } else if (type === 'all-bank') {
      setCashOnHand(0);
      setCashInBank(net);
    } else {
      const half = Math.round((net / 2) * 100) / 100;
      setCashOnHand(half);
      setCashInBank(net - half);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !date) return;
    setIsSubmitting(true);

    const s = Number(salesAmount) || 0;
    const coh = Number(cashOnHand) || 0;
    const cib = Number(cashInBank) || 0;
    const c = Number(cwt) || 0;

    const data = {
      date,
      client,
      description,
      invoice_no: invoiceNo,
      sales_amount: s || (coh + cib + c),
      cash_on_hand: coh,
      cash_in_bank: cib,
      cwt: c,
      status,
    };

    try {
      if (editingReceipt) {
        await onUpdateReceipt(editingReceipt.id, data);
      } else {
        await onAddReceipt(data);
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Receipts Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Sales (Credit)</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{format(totals.sales)}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Recorded CRJ Total</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Debit Cash on Hand</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{format(totals.cash)}</p>
          <span className="text-[10px] text-slate-400 font-medium">Physical Collections</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Debit Cash in Bank</p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{format(totals.bank)}</p>
          <span className="text-[10px] text-slate-400 font-medium">Bank Wire / Cheques</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Debit CWT (Form 2307)</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{format(totals.cwt)}</p>
          <span className="text-[10px] text-slate-400 font-medium">2% Withholding Credit</span>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search client, invoice #, service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 border border-transparent dark:border-slate-700 text-xs font-medium focus:outline-hidden"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredReceipts.length}</span> entries
            </span>
            <button
              onClick={openAddModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Receipt</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client / Particulars</th>
                <th className="py-3 px-4">SI No.</th>
                <th className="py-3 px-4 text-right">Debit Cash</th>
                <th className="py-3 px-4 text-right">Debit Bank</th>
                <th className="py-3 px-4 text-right">Debit CWT</th>
                <th className="py-3 px-4 text-right">Credit Sales</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No cash receipts match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{r.client}</p>
                      {r.description && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{r.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {r.invoice_no ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {r.invoice_no}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {r.cash_on_hand > 0 ? format(r.cash_on_hand) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {r.cash_in_bank > 0 ? format(r.cash_in_bank) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-purple-600 dark:text-purple-400 whitespace-nowrap">
                      {r.cwt > 0 ? format(r.cwt) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {format(r.sales_amount)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {r.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Receipt"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete receipt for ${r.client}?`)) {
                              onDeleteReceipt(r.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Receipt"
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

      {/* Add / Edit Receipt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden text-xs">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingReceipt ? 'Edit Sales Receipt' : 'New Cash Receipt (CRJ)'}
                </h3>
                <p className="text-[11px] text-slate-500">Record client payment, sales invoice, and withholding tax</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Receipt Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Sales Invoice No. (SI #)</label>
                  <input
                    type="text"
                    placeholder="e.g. 00544 or 2408B..."
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Client / Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jubillee Commerce & Trucking"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                {/* Suggestions */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {topClients.slice(0, 4).map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setClient(c)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      + {c.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description / Particulars</label>
                <input
                  type="text"
                  placeholder="e.g. Labor & parts for truck overhaul, injector repair"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Amount & Deposit Breakdown</span>
                  <button
                    type="button"
                    onClick={handleAutoCalcCWT}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Auto 2% CWT (Form 2307)
                  </button>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Total Sales Amount ({sym}) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={salesAmount}
                    onChange={(e) => {
                      const v = e.target.value === '' ? '' : Number(e.target.value);
                      setSalesAmount(v);
                      if (v !== '' && !cashOnHand && !cashInBank) {
                        setCashOnHand(v);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg font-bold text-sm text-slate-900 dark:text-white"
                  />
                </div>

                {/* Quick Split Buttons */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400">Quick Deposit:</span>
                  <button
                    type="button"
                    onClick={() => handleDepositSplit('all-cash')}
                    className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-medium"
                  >
                    100% Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDepositSplit('all-bank')}
                    className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-medium"
                  >
                    100% Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDepositSplit('split-5050')}
                    className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-medium"
                  >
                    50 / 50 Split
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Debit Cash</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={cashOnHand}
                      onChange={(e) => setCashOnHand(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Debit Bank</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={cashInBank}
                      onChange={(e) => setCashInBank(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-purple-600 dark:text-purple-400 font-semibold mb-1">Debit CWT (2%)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={cwt}
                      onChange={(e) => setCwt(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-600 rounded-lg font-medium text-purple-700 dark:text-purple-300"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                >
                  <option value="Paid">Paid / Collected</option>
                  <option value="Pending">Pending Collection</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
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
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Saving...' : editingReceipt ? 'Update Receipt' : 'Save Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
