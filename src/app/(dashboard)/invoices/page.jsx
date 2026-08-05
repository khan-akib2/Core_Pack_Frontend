'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { useCustomModal } from '@/components/providers/ModalProvider';

export default function InvoicesPage() {
  const { confirm } = useCustomModal();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', search],
    queryFn: async () => {
      const res = await api.get(`/invoices?search=${encodeURIComponent(search)}`);
      return res.data.data;
    }
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/invoices/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  });

  const handleDelete = async (id, invNo) => {
    const isOk = await confirm({
      title: 'Delete Invoice',
      message: `Are you sure you want to delete invoice "${invNo}"?`,
      confirmText: 'Delete Invoice',
      variant: 'danger'
    });
    if (isOk) {
      deleteInvoiceMutation.mutate(id);
    }
  };

  const invoices = Array.isArray(invoicesData) ? invoicesData : invoicesData?.data || [];

  return (
    <div className="space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">GST Tax Invoices</h1>
          <p className="text-xs text-slate-500 mt-0.5">Create, track, and manage GST compliant tax invoices</p>
        </div>
        <Link href="/invoices/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create New Invoice
          </Button>
        </Link>
      </div>

      <Card className="p-1.5 px-3 border-slate-200/80">
        <div className="flex items-center space-x-2">
          <Search className="w-4.5 h-4.5 text-slate-400" />
          <Input
            placeholder="Search by Invoice #, Customer Name, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none shadow-none focus:ring-0 text-xs placeholder:text-slate-400 py-1.5 px-1"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-3.5 pl-4">Invoice #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">Loading invoices...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">No invoices found.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-4 font-mono font-semibold text-orange-600">
                      <Link href={`/invoices/${inv._id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-900 text-xs">{inv.customerSnapshot?.companyName || inv.customerSnapshot?.name}</p>
                      <p className="text-[11px] text-slate-400">GST: {inv.customerSnapshot?.gstin || 'Unregistered'}</p>
                    </td>
                    <td className="p-3.5 text-xs text-slate-500">{formatDate(inv.invoiceDate)}</td>
                    <td className="p-3.5 font-bold text-slate-900">{formatCurrency(inv.grandTotal)}</td>
                    <td className="p-3.5">
                      <Badge variant={inv.paymentStatus === 'Paid' ? 'success' : inv.paymentStatus === 'Partial' ? 'warning' : 'danger'}>
                        {inv.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/invoices/${inv._id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleDelete(inv._id, inv.invoiceNumber)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Invoice"
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
      </Card>
    </div>
  );
}
