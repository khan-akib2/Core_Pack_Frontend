'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  ArrowUpRight,
  History,
  FileText,
  AlertCircle,
  TrendingUp,
  Download
} from 'lucide-react';
import { debounce } from 'lodash';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { PaymentHistoryModal } from '@/components/payments/PaymentHistoryModal';
import { CustomerStatementModal } from '@/components/payments/CustomerStatementModal';

import { KpiCardSkeleton, TableSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function PendingPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [selectedInvoiceForHistory, setSelectedInvoiceForHistory] = useState(null);
  const [selectedCustomerForStatement, setSelectedCustomerForStatement] = useState(null);

  const updateSearch = useCallback(
    debounce((value) => setDebouncedSearch(value), 300),
    []
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    updateSearch(e.target.value);
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ['pendingPayments', statusFilter, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (debouncedSearch) params.append('search', debouncedSearch);
      
      const res = await api.get(`/payments/pending?${params.toString()}`);
      return res.data;
    },
    staleTime: 1 * 60 * 1000 // 1 minute freshness for financial balance tracking
  });

  const invoices = response?.data?.invoices || [];
  const summary = response?.data?.summary || { totalOutstanding: 0, unpaidCount: 0, partialCount: 0, overdueCount: 0, overdueAmount: 0 };

  const handleExport = async () => {
    if (!invoices.length) return;
    
    const headers = ['Company', 'Invoice Number', 'Date', 'Total Amount', 'Paid Amount', 'Pending Amount', 'Status'];
    const rows = invoices.map(inv => [
      `"${inv.customerSnapshot?.companyName || inv.customerSnapshot?.name || ''}"`,
      inv.invoiceNumber,
      formatDate(inv.invoiceDate),
      inv.grandTotal,
      inv.paidAmount,
      inv.dueAmount,
      inv.paymentStatus
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const fileName = `Pending_Payments_${new Date().toISOString().split('T')[0]}.csv`;

    if (Capacitor.isNativePlatform()) {
      try {
        const base64Data = btoa(unescape(encodeURIComponent(csvContent)));
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });
        await Share.share({
          title: fileName,
          text: 'Pending Payments Report',
          files: [result.uri],
          dialogTitle: 'Save or Share Report'
        });
      } catch (err) {
        if (!/cancel|canceled|cancelled|dismissed/i.test(err?.message || String(err))) {
          console.error('File export error:', err);
        }
      }
    } else {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    }
  };

  return (
    <div className="space-y-6 antialiased pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pending Payments</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track outstanding invoices and customer receivables</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <KpiCardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Outstanding</p>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{formatCurrency(summary.totalOutstanding)}</p>
            </div>
            <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>Across all pending invoices</span>
            </div>
          </Card>
          
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unpaid Invoices</p>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{summary.unpaidCount}</p>
            </div>
            <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-rose-500">
              <AlertCircle className="w-4 h-4" />
              <span>0% received</span>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Partially Paid</p>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{summary.partialCount}</p>
            </div>
            <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-amber-500">
              <History className="w-4 h-4" />
              <span>Payments in progress</span>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between bg-rose-50/30 border-rose-100">
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Overdue</p>
              <p className="text-2xl font-bold text-rose-900 mt-1.5 tracking-tight">{formatCurrency(summary.overdueAmount)}</p>
            </div>
            <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-rose-600">
              <AlertCircle className="w-4 h-4" />
              <span>{summary.overdueCount} invoices past due</span>
            </div>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card className="p-4 border-slate-200/80 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, invoice..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {['All', 'Unpaid', 'Partial'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </Card>

      {/* Desktop List */}
      <div className="hidden sm:block">
        <Card className="border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            {isLoading ? (
              <TableSkeleton rows={5} cols={8} />
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Bill Total</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">All payments are up to date. No pending invoices.</td></tr>
                ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <button 
                        onClick={() => setSelectedCustomerForStatement(inv.customerId)}
                        className="hover:text-orange-600 transition-colors text-left truncate max-w-[180px] block"
                      >
                        {inv.customerSnapshot?.companyName || inv.customerSnapshot?.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-orange-600">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(inv.invoiceDate)}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(inv.grandTotal)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">{formatCurrency(inv.paidAmount)}</td>
                    <td className="px-4 py-3 font-bold text-orange-600">{formatCurrency(inv.dueAmount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={inv.paymentStatus === 'Partial' ? 'warning' : 'danger'}>
                        {inv.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedInvoiceForHistory(inv)}
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="View History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setSelectedInvoiceForPayment(inv)}
                          className="px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100 rounded-lg text-xs font-bold transition-colors"
                        >
                          Pay
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4">
        {isLoading ? (
          <CardSkeleton count={4} />
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-100 shadow-sm">All payments are up to date.</div>
        ) : (
          invoices.map((inv) => (
            <Card key={inv._id} className="p-4 border-slate-200/80 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <button 
                  onClick={() => setSelectedCustomerForStatement(inv.customerId)}
                  className="font-bold text-slate-900 text-sm hover:text-orange-600 text-left max-w-[70%]"
                >
                  {inv.customerSnapshot?.companyName || inv.customerSnapshot?.name}
                </button>
                <Badge variant={inv.paymentStatus === 'Partial' ? 'warning' : 'danger'}>
                  {inv.paymentStatus}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center mb-4 text-xs text-slate-500 font-medium">
                <span className="font-mono text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{inv.invoiceNumber}</span>
                <span>{formatDate(inv.invoiceDate)}</span>
              </div>

              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Bill Total</span>
                  <span className="font-bold text-slate-900">{formatCurrency(inv.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Paid</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(inv.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                  <span className="text-slate-700 font-semibold">Outstanding</span>
                  <span className="font-bold text-orange-600">{formatCurrency(inv.dueAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setSelectedInvoiceForHistory(inv)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors"
                >
                  <History className="w-3.5 h-3.5" /> History
                </button>
                <button 
                  onClick={() => setSelectedInvoiceForPayment(inv)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 rounded-lg text-xs font-bold transition-colors"
                >
                  Record Payment
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <RecordPaymentModal 
        isOpen={!!selectedInvoiceForPayment} 
        onClose={() => setSelectedInvoiceForPayment(null)} 
        invoice={selectedInvoiceForPayment} 
      />

      <PaymentHistoryModal 
        isOpen={!!selectedInvoiceForHistory} 
        onClose={() => setSelectedInvoiceForHistory(null)} 
        invoice={selectedInvoiceForHistory} 
      />

      <CustomerStatementModal 
        isOpen={!!selectedCustomerForStatement} 
        onClose={() => setSelectedCustomerForStatement(null)} 
        customerId={selectedCustomerForStatement} 
      />
    </div>
  );
}
