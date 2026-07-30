'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ChallanPrintable } from '@/components/printable/ChallanPrintable';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChallanDetailPage() {
  const { id } = useParams();

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
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-3">
          <Link href="/delivery-challans">
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">Delivery Challan {challan.challanNumber}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print Delivery Challan
          </Button>
        </div>
      </div>

      <div className="py-4">
        <ChallanPrintable challan={challan} company={company} />
      </div>
    </div>
  );
}
