'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { Search, Plus, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { DocumentPreviewModal } from '@/components/ui/DocumentPreviewModal';

import { useCustomModal } from '@/components/providers/ModalProvider';

export default function DeliveryChallansPage() {
  const { confirm } = useCustomModal();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const [previewModal, setPreviewModal] = useState({ isOpen: false, type: null, id: null });

  const { data: challansData, isLoading } = useQuery({
    queryKey: ['challans', search],
    queryFn: async () => {
      const res = await api.get(`/challans?search=${encodeURIComponent(search)}`);
      return res.data.data;
    }
  });

  const deleteChallanMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/challans/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    }
  });

  const handleDelete = async (id, challanNo) => {
    const isOk = await confirm({
      title: 'Delete Delivery Challan',
      message: `Are you sure you want to delete delivery challan "${challanNo}"?`,
      confirmText: 'Delete Challan',
      variant: 'danger'
    });
    if (isOk) {
      deleteChallanMutation.mutate(id);
    }
  };

  const challans = Array.isArray(challansData) ? challansData : challansData?.data || [];

  return (
    <div className="space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Delivery Challans</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track factory dispatches, goods movement, and vehicle logs</p>
        </div>
        <Link href="/delivery-challans/new" className="w-full sm:w-auto">
          <Button className="flex items-center justify-center gap-2 w-full whitespace-nowrap">
            <Plus className="w-4 h-4" /> Issue Delivery Challan
          </Button>
        </Link>
      </div>

      <Card className="p-1.5 px-3 border-slate-200/80">
        <div className="flex items-center space-x-2">
          <Search className="w-4.5 h-4.5 text-slate-400" />
          <Input
            placeholder="Search by Challan #, Vehicle No, Customer..."
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
                <th className="p-3.5 pl-4">Challan #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Vehicle No</th>
                <th className="p-3.5">Dispatch Date</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">Loading delivery challans...</td>
                </tr>
              ) : challans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">No delivery challans found.</td>
                </tr>
              ) : (
                challans.map((dc) => (
                  <tr key={dc._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-4 font-mono font-semibold text-orange-600">
                      <Link href={`/delivery-challans/${dc._id}`}>{dc.challanNumber}</Link>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {dc.customerSnapshot?.companyName || dc.customerSnapshot?.name}
                    </td>
                    <td className="p-3.5 font-mono text-xs uppercase text-slate-600">{dc.vehicleNo || 'N/A'}</td>
                    <td className="p-3.5 text-xs text-slate-500">{formatDate(dc.challanDate)}</td>
                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => setPreviewModal({ isOpen: true, type: 'challan', id: dc._id })}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                        <button
                          onClick={() => handleDelete(dc._id, dc.challanNumber)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Delivery Challan"
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

      <DocumentPreviewModal 
        isOpen={previewModal.isOpen} 
        onClose={() => setPreviewModal({ isOpen: false, type: null, id: null })} 
        type={previewModal.type} 
        documentId={previewModal.id} 
      />
    </div>
  );
}
