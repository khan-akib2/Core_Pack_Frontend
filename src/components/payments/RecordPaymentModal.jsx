'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { X, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function RecordPaymentModal({ isOpen, onClose, invoice, onSuccess }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    amount: invoice?.dueAmount || 0,
    paymentDate: new Date().toISOString().split('T')[0],
    mode: 'Bank Transfer',
    referenceNo: '',
    notes: ''
  });
  const [error, setError] = useState(null);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/payments', {
        invoiceId: invoice._id,
        ...data
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['recentInvoices'] });
      if (invoice?._id) {
        queryClient.invalidateQueries({ queryKey: ['invoice', invoice._id] });
      }
      queryClient.invalidateQueries({ queryKey: ['customerSummary'] });
      queryClient.invalidateQueries({ queryKey: ['salesReport'] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to record payment');
    }
  });

  if (!isOpen || !invoice) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    
    const amount = Number(formData.amount);
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (amount > invoice.dueAmount) {
      setError(`Amount cannot exceed the outstanding balance of ${formatCurrency(invoice.dueAmount)}`);
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Record Payment</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Invoice {invoice.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="mb-5 bg-orange-50/50 rounded-xl p-3 border border-orange-100 flex justify-between items-center">
            <span className="text-xs font-semibold text-orange-800 uppercase tracking-wider">Outstanding Balance</span>
            <span className="text-lg font-bold text-orange-600">{formatCurrency(invoice.dueAmount)}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Mode</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white"
                  value={formData.mode}
                  onChange={(e) => setFormData({...formData, mode: e.target.value})}
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reference Number <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                placeholder="e.g. UTR or Cheque No"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                value={formData.referenceNo}
                onChange={(e) => setFormData({...formData, referenceNo: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save Payment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
