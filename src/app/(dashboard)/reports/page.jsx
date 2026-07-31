'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Download, FileSpreadsheet, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReportPrintable } from '@/components/printable/ReportPrintable';

export default function ReportsPage() {
  const { data: salesReport } = useQuery({
    queryKey: ['salesReport'],
    queryFn: async () => {
      const res = await api.get('/reports/sales');
      return res.data.data;
    }
  });

  const { data: gstr1Report } = useQuery({
    queryKey: ['gstr1Report'],
    queryFn: async () => {
      const res = await api.get('/reports/gstr-1');
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

  const summary = salesReport?.summary || {};

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const b2b = gstr1Report?.b2bInvoices || [];
    const b2c = gstr1Report?.b2cInvoices || [];
    const all = [...b2b, ...b2c];

    let csvContent = "data:text/csv;charset=utf-8,Invoice Number,Customer Name,GSTIN,Invoice Date,Taxable Amount,CGST,SGST,IGST,Grand Total\n";
    all.forEach(inv => {
      const customer = (inv.customerSnapshot?.companyName || inv.customerSnapshot?.name || '').replace(/"/g, '""');
      const gstin = (inv.customerSnapshot?.gstin || '').replace(/"/g, '""');
      const cgst = inv.cgstTotal || (inv.igstTotal ? inv.igstTotal / 2 : 0);
      const sgst = inv.sgstTotal || (inv.igstTotal ? inv.igstTotal / 2 : 0);
      csvContent += `"${inv.invoiceNumber}","${customer}","${gstin}","${inv.invoiceDate || ''}","${inv.subtotal || 0}","${cgst}","${sgst}","0","${inv.grandTotal || 0}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSTR1_Sales_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <>
      <div className="space-y-6 antialiased print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">GST & Sales Reports</h1>
            <p className="text-xs text-slate-500 mt-0.5">GSTR-1 return filing, tax liabilities, and sales performance analytics</p>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 whitespace-nowrap">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
            </Button>
            <Button variant="primary" size="sm" onClick={handleExportPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap">
              <Printer className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-5 border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CGST Collected</span>
            <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{formatCurrency(summary.totalCgst || 0)}</p>
          </Card>
          <Card className="p-5 border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SGST Collected</span>
            <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{formatCurrency(summary.totalSgst || 0)}</p>
          </Card>
          <Card className="p-5 border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IGST Collected</span>
            <p className="text-2xl font-bold text-slate-400 mt-1.5 tracking-tight">—</p>
          </Card>
        </div>

        <Card className="p-6 border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-orange-600" /> GSTR-1 Return Filing Data
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Summary of B2B and B2C invoices for current GST period</p>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex-1 sm:flex-none flex items-center justify-center whitespace-nowrap">
                <Download className="w-4 h-4 mr-1.5" /> CSV / Excel
              </Button>
              <Button size="sm" onClick={handleExportPDF} className="flex-1 sm:flex-none flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap">
                <Printer className="w-4 h-4 mr-1.5" /> Export PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1.5">
              <h4 className="text-sm font-semibold text-slate-900">B2B Invoices (With GSTIN)</h4>
              <p className="text-xs text-slate-500">Total B2B Count: <span className="font-mono font-semibold text-slate-800">{gstr1Report?.b2bInvoices?.length || 0}</span></p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(gstr1Report?.totalB2B || 0)}</p>
            </div>

            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1.5">
              <h4 className="text-sm font-semibold text-slate-900">B2C Invoices (Retail / Consumer)</h4>
              <p className="text-xs text-slate-500">Total B2C Count: <span className="font-mono font-semibold text-slate-800">{gstr1Report?.b2cInvoices?.length || 0}</span></p>
              <p className="text-2xl font-bold text-orange-600 mt-2">{formatCurrency(gstr1Report?.totalB2C || 0)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Clean PDF Printable Component */}
      <ReportPrintable salesReport={salesReport} gstr1Report={gstr1Report} company={company} />
    </>
  );
}
