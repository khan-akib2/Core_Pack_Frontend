'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useCustomModal } from '@/components/providers/ModalProvider';

export default function EditDeliveryChallanPage() {
  const { showAlert } = useCustomModal();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const [customerId, setCustomerId] = useState('');
  const [challanDate, setChallanDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleNo, setVehicleNo] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState([
    { productId: '', name: '', hsnCode: '44151000', qty: 1, unit: 'Pcs', remarks: '' }
  ]);

  const { data: counterData } = useQuery({
    queryKey: ['nextCounterChallan'],
    queryFn: async () => {
      const res = await api.get('/counters/next?type=challan');
      return res.data.data;
    }
  });

  const nextChallanNo = counterData?.nextNumber || '001';

  const { data: existingChallan, isLoading: isFetchingChallan } = useQuery({
    queryKey: ['challan', id],
    queryFn: async () => {
      const res = await api.get(`/challans/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (existingChallan) {
      setCustomerId(existingChallan.customerId || '');
      if (existingChallan.challanDate) {
        setChallanDate(new Date(existingChallan.challanDate).toISOString().split('T')[0]);
      }
      setVehicleNo(existingChallan.vehicleNo || '');
      setNotes(existingChallan.notes || '');
      if (existingChallan.items && existingChallan.items.length > 0) {
        setItems(existingChallan.items);
      }
    }
  }, [existingChallan]);

  const { data: customers } = useQuery({
    queryKey: ['customersList'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data.data;
    }
  });

  const { data: products } = useQuery({
    queryKey: ['productsList'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data.data;
    }
  });

  const updateChallanMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put(`/challans/${id}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      router.push(`/delivery-challans/${data.data._id || data.data.id || id}`);
    },
    onError: (err) => {
      console.error('Delivery Challan Update Error:', err);
      showAlert({
        title: 'Challan Update Error',
        message: err.response?.data?.message || err.message || 'Error updating delivery challan. Please check all fields.',
        variant: 'danger'
      });
    }
  });

  const handleProductSelect = (index, productId) => {
    if (!productId) {
      const updated = [...items];
      updated[index] = { ...updated[index], productId: '' };
      setItems(updated);
      return;
    }
    const prod = products?.find(p => String(p._id || p.id) === String(productId));
    if (!prod) return;

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId: prod._id || prod.id,
      name: prod.name,
      hsnCode: prod.hsnCode || '44151000',
      unit: prod.unit || 'Pcs'
    };
    setItems(updated);
  };

  const updateItemField = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { productId: '', name: '', hsnCode: '44151000', qty: 1, unit: 'Pcs', remarks: '' }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId) {
      return showAlert({ title: 'Customer Required', message: 'Please select a customer before generating the delivery challan.' });
    }

    const sanitizedItems = items.map(item => {
      let itemName = item.name;
      if (!itemName && item.productId) {
        const prod = products?.find(p => p._id === item.productId);
        itemName = prod?.name;
      }
      return {
        productId: item.productId || undefined,
        name: itemName || 'Packaging Product',
        hsnCode: item.hsnCode || '44151000',
        qty: Number(item.qty) || 1,
        unit: item.unit || 'Pcs',
        remarks: item.remarks || ''
      };
    });

    updateChallanMutation.mutate({
      customerId,
      challanDate,
      vehicleNo,
      notes,
      items: sanitizedItems
    });
  };

  if (isFetchingChallan) return <p className="text-slate-400 p-8 text-center">Loading Challan details...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12 antialiased">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link href={`/delivery-challans/${id}`}>
            <Button variant="outline" size="sm" className="shrink-0"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">Edit Delivery Challan</h1>
            <p className="text-xs text-slate-500 mt-0.5 truncate">Update challan details and items</p>
          </div>
        </div>
        <Button type="submit" className="w-full sm:w-auto" disabled={updateChallanMutation.isPending}>
          {updateChallanMutation.isPending ? 'Updating...' : 'Update Challan'}
        </Button>
      </div>

      <Card className="p-6 border-slate-200/80 space-y-5">
        <h2 className="text-sm font-bold text-orange-600 border-b border-slate-100 pb-2">Dispatch & Vehicle Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Select Consignee / Customer*"
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">-- Choose Customer --</option>
            {customers?.map(c => (
              <option key={c._id} value={c._id}>{c.companyName || c.name}</option>
            ))}
          </Select>

          <Input label="Challan Date *" type="date" value={challanDate} onChange={(e) => setChallanDate(e.target.value)} required />
          <Input label="Vehicle Number" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="e.g. MH 04 AB 1234" />
        </div>
      </Card>

      <Card className="p-6 border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-orange-600">Dispatched Items Particulars</h2>
          <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
            <Plus className="w-4 h-4 mr-1" /> Add Particular
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12 lg:col-span-5">
                  <Select
                    label="Product"
                    value={item.productId}
                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                  >
                    <option value="">-- Select Product --</option>
                    {products?.map(p => (
                      <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                    ))}
                  </Select>
                </div>

                <div className="col-span-12 lg:col-span-4">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Item Particular / Dimensions</label>
                  <input
                    type="text"
                    placeholder="e.g. Wooden Box 10x10"
                    value={item.name}
                    onChange={(e) => updateItemField(idx, 'name', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="col-span-8 lg:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Quantity</label>
                  <input
                    type="text"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) => updateItemField(idx, 'qty', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                  />
                </div>

                <div className="col-span-4 lg:col-span-1 flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => removeItemRow(idx)} 
                    className="flex items-center justify-center text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-2 rounded-lg text-xs font-medium transition-all h-[36px] w-full"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </form>
  );
}
