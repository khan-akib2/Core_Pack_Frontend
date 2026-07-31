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

export default function QuotationsPage() {
  const { confirm } = useCustomModal();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: quotationsData, isLoading } = useQuery({
    queryKey: ['quotations', search],
    queryFn: async () => {
      const res = await api.get(`/quotations?search=${encodeURIComponent(search)}`);
      return res.data.data;
    }
  });

  const deleteQuotationMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/quotations/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  });

  const handleDelete = async (id, quoteNo) => {
    const isOk = await confirm({
      title: 'Delete Quotation',
      message: `Are you sure you want to delete quotation "${quoteNo}"?`,
      confirmText: 'Delete Quotation',
      variant: 'danger'
    });
    if (isOk) {
      deleteQuotationMutation.mutate(id);
    }
  };

  const quotations = Array.isArray(quotationsData) ? quotationsData : quotationsData?.data || [];

  return (
    <div className="space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quotations Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate and manage official client price quotations</p>
        </div>
        <Link href="/quotations/new" className="w-full sm:w-auto">
          <Button className="flex items-center justify-center gap-2 w-full whitespace-nowrap">
            <Plus className="w-4 h-4" /> Create Quotation
          </Button>
        </Link>
      </div>

      <Card className="p-3.5 border-slate-200/80">
        <div className="flex items-center space-x-3">
          <Search className="w-4.5 h-4.5 text-slate-400" />
          <Input
            placeholder="Search by Quotation #, Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none shadow-none focus:ring-0 text-xs placeholder:text-slate-400"
          />
        </div>
      </Card>

      <Card className="p-0 overflow-hidden border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-3.5 pl-4">Quote #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Valid Until</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 font-medium">Loading quotations...</td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 font-medium">No quotations found.</td>
                </tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-4 font-mono font-semibold text-orange-600">
                      <Link href={`/quotations/${q._id}`}>{q.quoteNumber}</Link>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {q.customerSnapshot?.companyName || q.customerSnapshot?.name}
                    </td>
                    <td className="p-3.5 text-xs text-slate-500">{formatDate(q.quoteDate)}</td>
                    <td className="p-3.5 text-xs text-slate-500">{formatDate(q.validUntil)}</td>
                    <td className="p-3.5 font-bold text-slate-900">{formatCurrency(q.grandTotal)}</td>
                    <td className="p-3.5">
                      <Badge variant={q.status === 'Accepted' ? 'success' : q.status === 'Sent' ? 'info' : 'default'}>
                        {q.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/quotations/${q._id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                        </Link>
                        <button
                          onClick={() => handleDelete(q._id, q.quoteNumber)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Quotation"
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
