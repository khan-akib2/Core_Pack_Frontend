'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export function PaymentHistoryModal({ isOpen, onClose, invoice }) {
  const queryClient = useQueryClient();
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const { data: paymentsRes, isLoading } = useQuery({
    queryKey: ['paymentHistory', invoice?._id],
    queryFn: async () => {
      const res = await api.get(`/payments/invoice/${invoice._id}`);
      return res.data;
    },
    enabled: isOpen && !!invoice?._id
  });

  const deleteMutation = useMutation({
    mutationFn: async (paymentId) => {
      const res = await api.delete(`/payments/${paymentId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentHistory', invoice?._id] });
      queryClient.invalidateQueries({ queryKey: ['pendingPayments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['recentInvoices'] });
      if (invoice?._id) {
        queryClient.invalidateQueries({ queryKey: ['invoice', invoice._id] });
      }
      queryClient.invalidateQueries({ queryKey: ['customerSummary'] });
      queryClient.invalidateQueries({ queryKey: ['salesReport'] });
      setPaymentToDelete(null);
    }
  });

  if (!isOpen || !invoice) return null;

  const payments = paymentsRes?.data || [];

  const handleDelete = (paymentId) => {
    setPaymentToDelete(paymentId);
  };

  const confirmDelete = () => {
    if (paymentToDelete) {
      deleteMutation.mutate(paymentToDelete);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Payment History</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Invoice {invoice.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {/* Invoice Summary Header */}
          <div className="flex justify-between items-center mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bill Total</p>
              <p className="text-sm font-bold text-slate-900">{formatCurrency(invoice.grandTotal)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Paid</p>
              <p className="text-sm font-bold text-emerald-600">{formatCurrency(invoice.paidAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Remaining</p>
              <p className="text-sm font-bold text-orange-600">{formatCurrency(invoice.dueAmount)}</p>
            </div>
          </div>

          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            Timeline
            <Badge variant={invoice.paymentStatus === 'Paid' ? 'success' : invoice.paymentStatus === 'Partial' ? 'warning' : 'danger'}>
              {invoice.paymentStatus}
            </Badge>
          </h3>

          {isLoading ? (
            <div className="py-8 text-center text-slate-500 text-sm font-medium">Loading history...</div>
          ) : payments.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">No payments recorded yet.</p>
              <p className="text-slate-400 text-xs mt-1">The full invoice amount remains outstanding.</p>
            </div>
          ) : (
            <div className="relative pl-3 border-l-2 border-slate-100 space-y-6">
              {payments.map((payment, index) => (
                <div key={payment.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[17px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                  
                  <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3.5 hover:border-slate-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {formatDate(payment.paymentDate)} &bull; {payment.mode}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDelete(payment.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Payment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {payment.referenceNo && (
                      <div className="mt-2 text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded inline-block">
                        Ref: {payment.referenceNo}
                      </div>
                    )}
                    {payment.notes && (
                      <p className="mt-2 text-xs text-slate-500 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                        {payment.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Remaining node */}
              <div className="relative pt-2">
                <div className="absolute -left-[17px] top-3 w-3 h-3 bg-orange-400 rounded-full border-2 border-white"></div>
                <div className="pl-1">
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(invoice.dueAmount)}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Remaining Balance</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Custom Delete Confirmation Modal */}
    {paymentToDelete && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center transform transition-all">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Payment?</h3>
            <p className="text-sm text-slate-500 mb-6 px-2">
              Are you sure you want to delete this payment? This will permanently remove the record and increase the invoice's outstanding balance.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setPaymentToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors w-full"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 w-full shadow-sm shadow-red-600/20"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
