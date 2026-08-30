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

export default function EditQuotationPage() {
  const { showAlert } = useCustomModal();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useParams();

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

  const { data: existingQuote, isLoading: isFetchingQuote } = useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const res = await api.get(`/quotations/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (existingQuote) {
      setCustomerId(existingQuote.customerId || '');
      if (existingQuote.quoteDate) {
        setQuoteDate(new Date(existingQuote.quoteDate).toISOString().split('T')[0]);
      }
      if (existingQuote.validUntil && existingQuote.quoteDate) {
        const diffTime = Math.abs(new Date(existingQuote.validUntil) - new Date(existingQuote.quoteDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setValidDays(diffDays);
      }
      setNotes(existingQuote.notes || '');
      if (existingQuote.items && existingQuote.items.length > 0) {
        setItems(existingQuote.items);
      }
    }
  }, [existingQuote]);

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

  const updateQuotationMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put(`/quotations/${id}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      router.push(`/quotations/${data.data._id || data.data.id || id}`);
    },
    onError: (err) => {
      console.error('Quotation Update Error:', err);
      showAlert({
        title: 'Quotation Update Error',
        message: err.response?.data?.message || err.message || 'Error updating quotation. Please check all required fields.',
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

    updateQuotationMutation.mutate({
      customerId,
      quoteDate,
      validUntil,
      notes,
      items: sanitizedItems
    });
  };

  if (isFetchingQuote) return <p className="text-slate-400 p-8 text-center">Loading Quotation details...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12 antialiased">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link href={`/quotations/${params.id}`}>
            <Button variant="outline" size="sm" className="shrink-0"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">Edit Quotation</h1>
            <p className="text-xs text-slate-500 mt-0.5 truncate">Modify terms, add items, and update quotation</p>
          </div>
        </div>
        <Button type="submit" className="w-full sm:w-auto" disabled={updateQuotationMutation.isPending}>
          {updateQuotationMutation.isPending ? 'Updating...' : 'Update Quotation'}
        </Button>
      </div>

      <Card className="p-6 border-slate-200/80 space-y-5">
        <h2 className="text-sm font-bold text-orange-600 border-b border-slate-100 pb-2">Customer & Quotation Date</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Select Client Customer*"
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
        </div>
      </Card>

      <Card className="p-6 border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-orange-600">Quotation Line Items</h2>
          <Button type="button" variant="outline" size="sm" onClick={addItemRow} className="whitespace-nowrap">
            <Plus className="w-4 h-4 mr-1" /> Add Line Item
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 items-start md:items-center bg-slate-50/80 p-4 md:p-3 rounded-xl border border-slate-200 relative">
              {/* Mobile Remove Button - Top Right */}
              <button 
                type="button" 
                onClick={() => removeItemRow(idx)} 
                className="md:hidden absolute top-2 right-2 text-slate-400 hover:text-rose-500 p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="w-full md:col-span-3">
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

              <div className="w-full md:col-span-2">
                <label className="md:hidden text-[10px] font-bold text-slate-500 uppercase mb-1 block">HSN Code</label>
                <input
                  type="text"
                  placeholder="HSN Code"
                  value={item.hsnCode}
                  onChange={(e) => updateItemField(idx, 'hsnCode', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div className="w-full flex md:contents gap-2">
                <div className="w-1/2 md:w-full md:col-span-2">
                  <label className="md:hidden text-[10px] font-bold text-slate-500 uppercase mb-1 block">Quantity</label>
                  <input
                    type="text"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) => updateItemField(idx, 'qty', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                  />
                </div>

                <div className="w-1/2 md:w-full md:col-span-2">
                  <label className="md:hidden text-[10px] font-bold text-slate-500 uppercase mb-1 block">Unit Rate ₹</label>
                  <input
                    type="number"
                    placeholder="Rate ₹"
                    value={item.rate}
                    onChange={(e) => updateItemField(idx, 'rate', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                  />
                </div>
              </div>



              <div className="w-full md:col-span-2">
                <label className="md:hidden text-[10px] font-bold text-slate-500 uppercase mb-1 block">GST Rate</label>
                <input
                  type="text"
                  value="5% (2.5% CGST + 2.5% SGST)"
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-500 font-semibold cursor-not-allowed truncate"
                />
              </div>

              <div className="hidden md:flex col-span-1 items-center justify-end">
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
