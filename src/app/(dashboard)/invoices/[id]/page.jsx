'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { InvoicePrintable } from '@/components/printable/InvoicePrintable';
import { Printer, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';

import { useCustomModal } from '@/components/providers/ModalProvider';

export default function InvoiceDetailPage() {
  const { showAlert } = useCustomModal();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [refNo, setRefNo] = useState('');

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await api.get(`/invoices/${id}`);
      return res.data.data;
    }
  });

  const { data: company } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const res = await api.get('/company');
      return res.data.data;
    }
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(`/invoices/${id}/payments`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setPaymentAmount('');
      setRefNo('');
    },
    onError: (err) => {
      showAlert({
        title: 'Payment Record Error',
        message: err.response?.data?.message || err.message || 'Error recording payment.',
        variant: 'danger'
      });
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    recordPaymentMutation.mutate({
      amount: Number(paymentAmount),
      mode: paymentMode,
      referenceNo: refNo
    });
  };

  if (isLoading) return <p className="text-slate-400 p-8 text-center">Loading Tax Invoice details...</p>;
  if (!invoice) return <p className="text-rose-400 p-8 text-center">Invoice not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link href="/invoices">
            <Button variant="outline" size="sm" className="shrink-0"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">Tax Invoice {invoice.invoiceNumber}</h1>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Button onClick={handlePrint} className="w-full sm:w-auto whitespace-nowrap">
            <Printer className="w-4 h-4 mr-2" /> Print A4 Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden items-start">
        <Card className="p-5 border-slate-800 lg:col-span-1 space-y-4 sticky top-6">
          <h3 className="font-semibold text-amber-400 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Record Payment Received
          </h3>
          <form onSubmit={handleRecordPayment} className="space-y-3">
            <Input
              label="Amount Paid (₹)"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder={`Max ${invoice.dueAmount}`}
              required
            />
            <Select
              label="Payment Mode"
              disabled
              value="Bank Transfer"
              className="opacity-90 cursor-not-allowed"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
            </Select>
            <Input
              label="Ref / UTR / Cheque No"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              placeholder="e.g. UTR987654321"
            />
            <Button type="submit" className="w-full" disabled={recordPaymentMutation.isPending}>
              {recordPaymentMutation.isPending ? 'Saving...' : 'Record Payment'}
            </Button>
          </form>
        </Card>

        <style>{`
          .responsive-bill { zoom: 0.42; }
          @media (min-width: 480px) { .responsive-bill { zoom: 0.55; } }
          @media (min-width: 640px) { .responsive-bill { zoom: 0.75; } }
          @media (min-width: 768px) { .responsive-bill { zoom: 0.9; } }
          @media (min-width: 1024px) { .responsive-bill { zoom: 0.65; } }
          @media (min-width: 1280px) { .responsive-bill { zoom: 0.75; } }
          @media (min-width: 1536px) { .responsive-bill { zoom: 0.9; } }
        `}</style>
        <div className="lg:col-span-2 overflow-auto flex justify-start xl:justify-center items-start print:hidden custom-scrollbar w-full p-2">
          <div className="responsive-bill origin-top shadow-2xl transition-all duration-300">
            <InvoicePrintable invoice={invoice} company={company} />
          </div>
        </div>
      </div>

      <div className="hidden print:block">
        <InvoicePrintable invoice={invoice} company={company} />
      </div>
    </div>
  );
}
