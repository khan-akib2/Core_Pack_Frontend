'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { X, ExternalLink, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function CustomerStatementModal({ isOpen, onClose, customerId }) {
  const { data: statementRes, isLoading } = useQuery({
    queryKey: ['customerSummary', customerId],
    queryFn: async () => {
      const res = await api.get(`/payments/customer-summary?customerId=${customerId}`);
      return res.data;
    },
    enabled: isOpen && !!customerId
  });

  if (!isOpen || !customerId) return null;

  const customer = statementRes?.data?.customer;
  const summary = statementRes?.data?.summary || { totalInvoiced: 0, totalReceived: 0, outstanding: 0, openInvoices: 0 };
  const invoices = statementRes?.data?.invoices || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer Statement</h2>
            {customer && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">{customer.companyName || customer.name}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500 text-sm font-medium">Loading statement...</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Total Invoiced</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(summary.totalInvoiced)}</p>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5">Total Received</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(summary.totalReceived)}</p>
                </div>
                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                  <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wider mb-1.5">Outstanding</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(summary.outstanding)}</p>
                  <p className="text-[10px] font-medium text-orange-600/80 mt-1">{summary.openInvoices} open invoices</p>
                </div>
              </div>

              {/* Invoice List */}
              <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Invoice History</h3>
              <div className="space-y-3">
                {invoices.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-4">No invoices found for this customer.</p>
                ) : (
                  invoices.map((inv) => (
                    <div key={inv._id} className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/invoices/${inv._id}`} className="font-mono text-sm font-bold text-orange-600 hover:underline flex items-center gap-1">
                            {inv.invoiceNumber} <ExternalLink className="w-3 h-3" />
                          </Link>
                          <Badge variant={inv.paymentStatus === 'Paid' ? 'success' : inv.paymentStatus === 'Partial' ? 'warning' : 'danger'}>
                            {inv.paymentStatus}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">{formatDate(inv.invoiceDate)}</p>
                      </div>
                      
                      <div className="text-right flex-1">
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(inv.grandTotal)}</p>
                        {inv.dueAmount > 0 ? (
                          <p className="text-[11px] font-bold text-orange-600 mt-0.5">{formatCurrency(inv.dueAmount)} Pending</p>
                        ) : (
                          <p className="text-[11px] font-bold text-emerald-600 mt-0.5">Fully Paid</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
