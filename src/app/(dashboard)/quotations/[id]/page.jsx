'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { QuotationPrintable } from '@/components/printable/QuotationPrintable';
import { Printer, ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';

export default function QuotationDetailPage() {
  const { id } = useParams();

  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const res = await api.get(`/quotations/${id}`);
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

  if (isLoading) return <p className="text-slate-400 p-8 text-center">Loading Quotation details...</p>;
  if (!quotation) return <p className="text-rose-400 p-8 text-center">Quotation not found.</p>;

  return (
    <div className="space-y-6 print:space-y-0 print:m-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link href="/quotations">
            <Button variant="outline" size="sm" className="shrink-0"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">Official Quotation {quotation.quoteNumber}</h1>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link href={`/quotations/edit/${id}`}>
            <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap">
              <Pencil className="w-4 h-4 mr-2" /> Edit Quotation
            </Button>
          </Link>
          <Button onClick={handlePrint} className="w-full sm:w-auto whitespace-nowrap">
            <Printer className="w-4 h-4 mr-2" /> Print Quotation
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
      <div className="py-4 overflow-auto flex justify-start xl:justify-center items-start print:hidden custom-scrollbar w-full p-2">
        <div className="responsive-bill origin-top shadow-2xl transition-all duration-300">
          <QuotationPrintable quotation={quotation} company={company} />
        </div>
      </div>
      <div className="hidden print:block">
        <QuotationPrintable quotation={quotation} company={company} />
      </div>
    </div>
  );
}
