'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useCustomModal } from '@/components/providers/ModalProvider';

export default function NewQuotationPage() {
  const { showAlert } = useCustomModal();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState('');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validDays, setValidDays] = useState(30);
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState([
    { productId: '', name: '', hsnCode: '44151000', qty: 1, rate: 0, taxRate: 5, unit: 'Pcs' }
  ]);

  const { data: counterData } = useQuery({
    queryKey: ['nextCounterQuote'],
    queryFn: async () => {
      const res = await api.get('/counters/next?type=quote');
      return res.data.data;
    }
  });

  const nextQuoteNo = counterData?.nextNumber || '001';

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

  const createQuotationMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/quotations', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      router.push(`/quotations/${data.data._id}`);
    },
    onError: (err) => {
      console.error('Quotation Creation Error:', err);
      showAlert({
        title: 'Quotation Creation Error',
        message: err.response?.data?.message || err.message || 'Error generating quotation. Please check all required fields.',
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
      rate: prod.defaultRate || 0,
      taxRate: prod.gstRate || 5,
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
    setItems([...items, { productId: '', name: '', hsnCode: '44151000', qty: 1, rate: 0, taxRate: 5, unit: 'Pcs' }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId) {
      return showAlert({ title: 'Customer Required', message: 'Please select a customer before generating the price quotation.' });
    }

    const validUntil = new Date(new Date(quoteDate).getTime() + validDays * 24 * 60 * 60 * 1000);

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
        rate: Number(item.rate) || 0,
        taxRate: Number(item.taxRate) || 5,
        unit: item.unit || 'Pcs'
      };
    });

    createQuotationMutation.mutate({
      customerId,
      quoteDate,
      validUntil,
      notes,
      items: sanitizedItems
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12 antialiased">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/quotations">
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create Price Quotation</h1>
            <p className="text-xs text-slate-500 mt-0.5">Auto-generated Quotation No: <span className="font-mono font-bold text-orange-600">{nextQuoteNo}</span></p>
          </div>
        </div>
        <Button type="submit" disabled={createQuotationMutation.isPending}>
          {createQuotationMutation.isPending ? 'Generating...' : 'Save & Issue Quotation'}
        </Button>
      </div>

      <Card className="p-6 border-slate-200/80 space-y-5">
        <h2 className="text-sm font-bold text-orange-600 border-b border-slate-100 pb-2">Customer & Validity Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Select Client Customer *"
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">-- Choose Customer --</option>
            {customers?.map(c => (
              <option key={c._id} value={c._id}>{c.companyName || c.name}</option>
            ))}
          </Select>

          <Input label="Quotation Date *" type="date" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} required />

          <Select
            label="Quotation Validity Period"
            value={validDays}
            onChange={(e) => setValidDays(Number(e.target.value))}
          >
            <option value={7}>Valid for 7 Days</option>
            <option value={15}>Valid for 15 Days</option>
            <option value={30}>Valid for 30 Days</option>
            <option value={60}>Valid for 60 Days</option>
          </Select>
        </div>
      </Card>

      <Card className="p-6 border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-orange-600">Quotation Line Items</h2>
          <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
            <Plus className="w-4 h-4 mr-1" /> Add Line Item
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50/80 p-3 rounded-xl border border-slate-200">
              <div className="col-span-3">
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

              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="HSN Code"
                  value={item.hsnCode}
                  onChange={(e) => updateItemField(idx, 'hsnCode', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => updateItemField(idx, 'qty', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  placeholder="Unit Rate ₹"
                  value={item.rate}
                  onChange={(e) => updateItemField(idx, 'rate', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>

              <div className="col-span-2">
                <Select
                  label="GST Rate"
                  value={item.taxRate}
                  onChange={(e) => updateItemField(idx, 'taxRate', Number(e.target.value))}
                >
                  <option value={5}>5% GST (2.5% + 2.5%)</option>
                </Select>
              </div>

              <div className="col-span-1 flex items-center justify-end">
                <button type="button" onClick={() => removeItemRow(idx)} className="text-slate-400 hover:text-rose-500 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </form>
  );
}
