'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Plus, Search, X, Edit, Trash2 } from 'lucide-react';

import { useCustomModal } from '@/components/providers/ModalProvider';

export default function CustomersPage() {
  const { confirm } = useCustomModal();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [street, setStreet] = useState('');

  const queryClient = useQueryClient();

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      const res = await api.get(`/customers?search=${encodeURIComponent(search)}`);
      return res.data.data;
    }
  });

  const customers = Array.isArray(customersData) ? customersData : customersData?.data || [];

  const createOrUpdateCustomerMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingId) {
        const res = await api.put(`/customers/${editingId}`, payload);
        return res.data;
      } else {
        const res = await api.post('/customers', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      resetForm();
    }
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/customers/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });

  const resetForm = () => {
    setShowModal(false);
    setEditingId(null);
    setCompanyName('');
    setGstin('');
    setStreet('');
  };

  const handleEdit = (cust) => {
    setEditingId(cust._id);
    setCompanyName(cust.companyName || cust.name || '');
    setGstin(cust.gstin || '');
    setStreet(cust.billingAddress?.street || '');
    setShowModal(true);
  };

  const handleDelete = async (id, custName) => {
    const isOk = await confirm({
      title: 'Delete Customer',
      message: `Are you sure you want to delete customer "${custName}"?`,
      confirmText: 'Delete Customer',
      variant: 'danger'
    });
    if (isOk) {
      deleteCustomerMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createOrUpdateCustomerMutation.mutate({
      name: companyName,
      companyName,
      gstin,
      billingAddress: {
        street,
        state: 'Maharashtra',
        stateCode: '27',
        pincode: '411001'
      }
    });
  };

  return (
    <div className="space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage client profiles, GSTIN validation, and billing addresses</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      <Card className="p-3.5 border-slate-200/80">
        <div className="flex items-center space-x-3">
          <Search className="w-4.5 h-4.5 text-slate-400" />
          <Input
            placeholder="Search by Company Name, GSTIN, Address..."
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
                <th className="p-3.5 pl-4">Company Name</th>
                <th className="p-3.5">GSTIN</th>
                <th className="p-3.5">Billing Address</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400 font-medium">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400 font-medium">No customers registered.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 pl-4 font-semibold text-slate-900">{c.companyName || c.name}</td>
                    <td className="p-3.5 font-mono font-semibold text-orange-600">{c.gstin || 'Unregistered'}</td>
                    <td className="p-3.5 text-xs text-slate-700">{c.billingAddress?.street || 'N/A'}</td>
                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                          title="Edit Customer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id, c.companyName || c.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Customer"
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

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">{editingId ? 'Edit Customer Profile' : 'Add New Customer Profile'}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Company Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              <Input label="GSTIN (15 Digits)" value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="27AABCC1234D1Z5" />
              <Input label="Billing Address" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g. Plot No 12, MIDC Area" />
              <div className="flex justify-end space-x-3 pt-3">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={createOrUpdateCustomerMutation.isPending}>
                  {editingId ? 'Update Customer' : 'Save Customer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
