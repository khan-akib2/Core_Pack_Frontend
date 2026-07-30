'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { QuotationPrintable } from '@/components/printable/QuotationPrintable';
import { Printer, ArrowLeft } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-3">
          <Link href="/quotations">
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">Official Quotation {quotation.quoteNumber}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print Quotation
          </Button>
        </div>
      </div>

      <div className="py-4">
        <QuotationPrintable quotation={quotation} company={company} />
      </div>
    </div>
  );
}
