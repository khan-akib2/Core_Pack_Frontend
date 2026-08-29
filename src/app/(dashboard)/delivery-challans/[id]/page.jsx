'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ChallanPrintable } from '@/components/printable/ChallanPrintable';
import { EmailDocumentModal } from '@/components/ui/EmailDocumentModal';
import { WhatsAppDocumentModal } from '@/components/ui/WhatsAppDocumentModal';
import { Printer, ArrowLeft, Pencil, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ChallanDetailPage() {
  const { id } = useParams();
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = React.useState(false);

  const { data: challan, isLoading } = useQuery({
    queryKey: ['challan', id],
    queryFn: async () => {
      const res = await api.get(`/challans/${id}`);
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

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <p className="text-slate-400 p-8 text-center">Loading Delivery Challan...</p>;
  if (!challan) return <p className="text-rose-400 p-8 text-center">Delivery Challan not found.</p>;

  return (
    <div className="space-y-6 print:space-y-0 print:m-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link href="/delivery-challans">
            <Button variant="outline" size="sm" className="shrink-0"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">Delivery Challan {challan.challanNumber}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link href={`/delivery-challans/edit/${id}`}>
            <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
              <Pencil className="w-4 h-4 mr-2" /> Edit Challan
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setIsWhatsAppModalOpen(true)} className="w-full sm:w-auto whitespace-nowrap text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
            <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
          </Button>
          <Button variant="outline" onClick={() => setIsEmailModalOpen(true)} className="w-full sm:w-auto whitespace-nowrap text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200">
            <Mail className="w-4 h-4 mr-2" /> Email
          </Button>
          <Button onClick={handlePrint} className="w-full sm:w-auto whitespace-nowrap">
            <Printer className="w-4 h-4 mr-2" /> Print Challan
          </Button>
        </div>
      </div>

      <style>{`
        .responsive-bill { zoom: 0.42; }
        @media (min-width: 480px) { .responsive-bill { zoom: 0.55; } }
        @media (min-width: 640px) { .responsive-bill { zoom: 0.75; } }
        @media (min-width: 768px) { .responsive-bill { zoom: 0.9; } }
        @media (min-width: 1024px) { .responsive-bill { zoom: 0.65; } }
        @media (min-width: 1280px) { .responsive-bill { zoom: 0.75; } }
        @media (min-width: 1536px) { .responsive-bill { zoom: 0.9; } }
      `}</style>
      <div className="py-4 overflow-hidden flex justify-start xl:justify-center items-start print:hidden w-full">
        <div className="responsive-bill origin-top shadow-2xl transition-all duration-300">
          <ChallanPrintable challan={challan} company={company} />
        </div>
      </div>

      <div className="hidden print:block">
        <ChallanPrintable challan={challan} company={company} />
      </div>

      <EmailDocumentModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        documentType="Delivery Challan"
        documentId={id}
        documentNumber={challan.challanNumber}
        defaultEmail={challan.customerSnapshot?.email || ''}
        defaultCustomerId={challan.customerId || ''}
        customerName={challan.customerSnapshot?.companyName || challan.customerSnapshot?.name || ''}
        apiEndpoint={`/challans/${id}/send-email/challan`}
      />

      <WhatsAppDocumentModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        documentType="Delivery Challan"
        documentId={id}
        documentNumber={challan.challanNumber}
        defaultPhone={challan.customerSnapshot?.phone || ''}
        defaultCustomerId={challan.customerId || ''}
        customerName={challan.customerSnapshot?.companyName || challan.customerSnapshot?.name || ''}
        apiEndpoint={`/challans/${id}/send-whatsapp/challan`}
      />
    </div>
  );
}
