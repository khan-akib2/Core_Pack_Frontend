'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, ArrowLeft, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';

import { useCustomModal } from '@/components/providers/ModalProvider';

export default function EditInvoicePage() {
  const { showAlert } = useCustomModal();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const [customerId, setCustomerId] = useState('');
  const [customInvoiceNumber, setCustomInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [challanNumber, setChallanNumber] = useState('');
  const [challanDate, setChallanDate] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [transportationCharges, setTransportationCharges] = useState('');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState([
    { productId: '', name: '', hsnCode: '44151000', qty: 1, rate: 0, boxSize: '', palletSize: '', taxRate: 5, unit: 'Pcs' }
  ]);

  const { data: counterData } = useQuery({
    queryKey: ['nextCounterInvoice'],
    queryFn: async () => {
      const res = await api.get('/counters/next?type=invoice');
      return res.data.data;
    }
  });

  const nextInvoiceNo = counterData?.nextNumber || '001';

  const { data: existingInvoice, isLoading: isFetchingInvoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await api.get(`/invoices/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (existingInvoice) {
      setCustomerId(existingInvoice.customerId || '');
      setCustomInvoiceNumber(existingInvoice.invoiceNumber || '');
      if (existingInvoice.invoiceDate) {
        setInvoiceDate(new Date(existingInvoice.invoiceDate).toISOString().split('T')[0]);
      }
      setChallanNumber(existingInvoice.challanNumber || '');
      if (existingInvoice.challanDate) {
        setChallanDate(new Date(existingInvoice.challanDate).toISOString().split('T')[0]);
      }
      setVehicleNo(existingInvoice.vehicleNo || '');
      setTransportationCharges(existingInvoice.transportationCharges || '');
      setNotes(existingInvoice.notes || '');
      if (existingInvoice.items && existingInvoice.items.length > 0) {
        setItems(existingInvoice.items);
      }
    } else if (nextInvoiceNo && !customInvoiceNumber) {
      setCustomInvoiceNumber(nextInvoiceNo);
    }
  }, [existingInvoice, nextInvoiceNo]);

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

  const updateInvoiceMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put(`/invoices/${id}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      router.push(`/invoices/${data.data._id || data.data.id || id}`);
    },
    onError: (err) => {
      console.error('Invoice Update Error:', err);
      showAlert({
        title: 'Invoice Update Failed',
        message: err.response?.data?.message || err.message || 'Error updating invoice. Please check all fields.',
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
    setItems([...items, { productId: '', name: '', hsnCode: '44151000', qty: 1, rate: 0, boxSize: '', palletSize: '', taxRate: 5, unit: 'Pcs' }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId) {
      return showAlert({ title: 'Customer Required', message: 'Please select a customer before issuing the invoice.' });
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
        rate: Number(item.rate) || 0,
        boxSize: item.boxSize || '',
        palletSize: item.palletSize || '',
        taxRate: Number(item.taxRate) || 5,
        unit: item.unit || 'Pcs'
      };
    });

    updateInvoiceMutation.mutate({
      customerId,
      customInvoiceNumber: customInvoiceNumber || nextInvoiceNo,
      invoiceDate,
      challanNumber,
      challanDate,
      vehicleNo,
      transportationCharges: Number(transportationCharges) || 0,
      notes,
      items: sanitizedItems
    });
  };

  if (isFetchingInvoice) return <p className="text-slate-400 p-8 text-center">Loading Invoice details...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12 antialiased">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link href={`/invoices/${id}`}>
            <Button variant="outline" size="sm" className="shrink-0"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">Edit Tax Invoice</h1>
            <p className="text-xs text-slate-500 mt-0.5 truncate">Modify invoice details and items</p>
          </div>
        </div>
        <Button type="submit" className="w-full sm:w-auto" disabled={updateInvoiceMutation.isPending}>
          {updateInvoiceMutation.isPending ? 'Updating...' : 'Update Invoice'}
        </Button>
      </div>

      <Card className="p-6 border-slate-200/80 space-y-5">
        <h2 className="text-sm font-bold text-orange-600 border-b border-slate-100 pb-2">Customer & Invoice Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <Input
            label="Invoice No. (Customizable) *"
            value={customInvoiceNumber}
            onChange={(e) => setCustomInvoiceNumber(e.target.value)}
            placeholder="e.g. 001"
            required
          />

          <Input label="Invoice Date *" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required />

          <Input label="Delivery Challan No" value={challanNumber} onChange={(e) => setChallanNumber(e.target.value)} placeholder="e.g. 001" />

          <Input label="Challan Date" type="date" value={challanDate} onChange={(e) => setChallanDate(e.target.value)} />

          <Input label="Vehicle No." value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="e.g. MH-04-XX-1234" />

          <Input
            label="Transportation Charges (₹)"
            type="number"
            value={transportationCharges}
            onChange={(e) => setTransportationCharges(e.target.value)}
            placeholder="e.g. 1500"
          />
        </div>
      </Card>

      <Card className="p-6 border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-orange-600">Invoice Items & Dimensions</h2>
          <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
            <Plus className="w-4 h-4 mr-1" /> Add Line Item
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-12 lg:col-span-4">
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

                <div className="col-span-6 lg:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">HSN Code</label>
                  <input
                    type="text"
                    placeholder="HSN Code"
                    value={item.hsnCode}
                    onChange={(e) => updateItemField(idx, 'hsnCode', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div className="col-span-6 lg:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Quantity</label>
                  <input
                    type="text"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) => updateItemField(idx, 'qty', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                  />
                </div>

                <div className="col-span-6 lg:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Rate (₹)</label>
                  <input
                    type="number"
                    placeholder="Rate ₹"
                    value={item.rate}
                    onChange={(e) => updateItemField(idx, 'rate', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
                  />
                </div>

                <div className="col-span-6 lg:col-span-2">
                  <Select
                    label="GST Rate"
                    value={item.taxRate}
                    onChange={(e) => updateItemField(idx, 'taxRate', Number(e.target.value))}
                  >
                    <option value={5}>5% GST (2.5% + 2.5%)</option>
                  </Select>
                </div>
              </div>

              {/* Item Actions */}
              <div className="flex items-center justify-end pt-2 border-t border-slate-200/60 mt-1">
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
