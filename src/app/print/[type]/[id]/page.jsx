'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { InvoicePrintable } from '@/components/printable/InvoicePrintable';
import { QuotationPrintable } from '@/components/printable/QuotationPrintable';
import { ChallanPrintable } from '@/components/printable/ChallanPrintable';
import { ReportPrintable } from '@/components/printable/ReportPrintable';

export default function PrintDocumentPage() {
  const { type, id } = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [data, setData] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [gstr1Report, setGstr1Report] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!token) {
        setError('Unauthorized: No token provided');
        setLoading(false);
        return;
      }
      
      // Temporarily set the token on the axios instance for this request
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      try {
        if (type === 'reports') {
          const month = searchParams.get('month');
          const year = searchParams.get('year');
          
          let m = month ? parseInt(month, 10) : new Date().getMonth();
          let y = year ? parseInt(year, 10) : new Date().getFullYear();
          setSelectedDate({ month: m, year: y });
          
          const startDate = new Date(y, m, 1).toISOString();
          const endDate = new Date(y, m + 1, 0, 23, 59, 59, 999).toISOString();
          
          const params = { month: m + 1, year: y };
          const sParams = { startDate, endDate };

          const [salesRes, gstrRes, compRes] = await Promise.all([
            api.get('/reports/sales', { params: sParams, ...config }),
            api.get('/reports/gstr-1', { params, ...config }),
            api.get('/company', config)
          ]);
          setSalesReport(salesRes.data.data);
          setGstr1Report(gstrRes.data.data);
          setCompany(compRes.data.data);
          setData(true); // Dummy data to bypass the !data check
        } else {
          let docEndpoint = '';
          if (type === 'invoice') docEndpoint = `/invoices/${id}`;
          else if (type === 'quotation') docEndpoint = `/quotations/${id}`;
          else if (type === 'challan') docEndpoint = `/challans/${id}`;
          else throw new Error('Invalid document type');

          const [docRes, compRes] = await Promise.all([
            api.get(docEndpoint, config),
            api.get('/company', config)
          ]);

          setData(docRes.data.data);
          setCompany(compRes.data.data);
        }
      } catch (err) {
        console.error('Print fetch error:', err);
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [type, id, token, searchParams]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-sans">Loading document for print...</div>;
  if (error) return <div className="p-8 text-center text-rose-500 font-sans font-bold">{error}</div>;
  if (!data) return <div className="p-8 text-center text-slate-500 font-sans">Document not found</div>;

  return (
    <div className="print-container">
      <style dangerouslySetInnerHTML={{__html: `
        /* Enforce a strict white desktop viewport for Puppeteer */
        body {
          background: white !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .print-container {
          width: 794px;
          margin: 0 auto;
          background: white;
        }
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-container {
            width: 100% !important;
          }
        }
      `}} />
      
      {type === 'invoice' && <InvoicePrintable invoice={data} company={company} />}
      {type === 'quotation' && <QuotationPrintable quotation={data} company={company} />}
      {type === 'challan' && <ChallanPrintable challan={data} company={company} />}
      {type === 'reports' && <ReportPrintable salesReport={salesReport} gstr1Report={gstr1Report} company={company} selectedDate={selectedDate} />}
    </div>
  );
}
