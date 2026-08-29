'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmailDocumentModal } from '@/components/ui/EmailDocumentModal';
import { WhatsAppDocumentModal } from '@/components/ui/WhatsAppDocumentModal';
import { InvoicePrintable } from '@/components/printable/InvoicePrintable';
import { Printer, ArrowLeft, CreditCard, Pencil, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';

import { useCustomModal } from '@/components/providers/ModalProvider';

export default function InvoiceDetailPage() {
  const { showAlert } = useCustomModal();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [refNo, setRefNo] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

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
    <div className="space-y-6 print:space-y-0 print:m-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link href="/invoices">
            <Button variant="outline" size="sm" className="shrink-0"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">Tax Invoice {invoice.invoiceNumber}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link href={`/invoices/edit/${id}`}>
            <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
              <Pencil className="w-4 h-4 mr-2" /> Edit Invoice
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setIsWhatsAppModalOpen(true)} className="w-full sm:w-auto whitespace-nowrap text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
            <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
          </Button>
          <Button variant="outline" onClick={() => setIsEmailModalOpen(true)} className="w-full sm:w-auto whitespace-nowrap text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200">
            <Mail className="w-4 h-4 mr-2" /> Email
          </Button>
          <Button onClick={handlePrint} className="w-full sm:w-auto whitespace-nowrap">
            <Printer className="w-4 h-4 mr-2" /> Print A4 Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden items-start">
        <Card className="p-5 border-slate-800 lg:col-span-1 space-y-4 lg:sticky lg:top-6 z-10">
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
        <div className="lg:col-span-2 flex justify-start xl:justify-center items-start print:hidden w-full overflow-hidden">
          <div className="responsive-bill origin-top shadow-2xl transition-all duration-300">
            <InvoicePrintable invoice={invoice} company={company} />
          </div>
        </div>
      </div>

      <div className="hidden print:block">
        <InvoicePrintable invoice={invoice} company={company} />
      </div>

      <EmailDocumentModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        documentType="Invoice"
        documentId={id}
        documentNumber={invoice.invoiceNumber}
        defaultEmail={invoice.customerSnapshot?.email || ''}
        defaultCustomerId={invoice.customerId || ''}
        customerName={invoice.customerSnapshot?.companyName || invoice.customerSnapshot?.name || ''}
        apiEndpoint={`/invoices/${id}/send-email/invoice`}
      />

      <WhatsAppDocumentModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        documentType="Invoice"
        documentId={id}
        documentNumber={invoice.invoiceNumber}
        defaultPhone={invoice.customerSnapshot?.phone || ''}
        defaultCustomerId={invoice.customerId || ''}
        customerName={invoice.customerSnapshot?.companyName || invoice.customerSnapshot?.name || ''}
        apiEndpoint={`/invoices/${id}/send-whatsapp/invoice`}
      />
    </div>
  );
}
