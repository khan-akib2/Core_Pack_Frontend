'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Download, FileSpreadsheet, Printer, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import * as XLSX from 'xlsx';
import { ReportPrintable } from '@/components/printable/ReportPrintable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { useCustomModal } from '@/components/providers/ModalProvider';

// Helper to calculate start/end dates for a given month/year
const getMonthDates = (year, monthIndex) => {
  const startDate = new Date(year, monthIndex, 1).toISOString();
  const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999).toISOString();
  return { startDate, endDate };
};

// Trend component
const TrendIndicator = ({ current = 0, previous = 0 }) => {
  if (!previous && !current) return null;
  
  let percentage = 0;
  if (!previous) {
    percentage = current > 0 ? 100 : 0;
  } else {
    percentage = ((current - previous) / previous) * 100;
  }
  
  const isPositive = percentage > 0;
  const isNeutral = percentage === 0;
  
  return (
    <div className={`flex items-center text-[11px] mt-1.5 font-medium ${isPositive ? 'text-emerald-600' : isNeutral ? 'text-slate-500' : 'text-rose-600'}`}>
      {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : isNeutral ? <Minus className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
      <span>
        {isNeutral ? 'No change' : `${Math.abs(percentage).toFixed(1)}%`}
        <span className="text-slate-400 font-normal ml-1">vs last month</span>
      </span>
    </div>
  );
};

export default function ReportsPage() {
  const { showAlert } = useCustomModal();
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });

  // Calculate current and previous month params
  const currentParams = useMemo(() => {
    return {
      sales: getMonthDates(selectedDate.year, selectedDate.month),
      gstr: { month: selectedDate.month + 1, year: selectedDate.year }
    };
  }, [selectedDate]);

  const prevParams = useMemo(() => {
    let prevMonth = selectedDate.month - 1;
    let prevYear = selectedDate.year;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }
    return {
      sales: getMonthDates(prevYear, prevMonth),
      gstr: { month: prevMonth + 1, year: prevYear }
    };
  }, [selectedDate]);

  // Current Month Queries
  const { data: salesReport, isFetching: isFetchingSales } = useQuery({
    queryKey: ['salesReport', currentParams.sales],
    queryFn: async () => {
      const res = await api.get('/reports/sales', { params: currentParams.sales });
      return res.data.data;
    },
    placeholderData: (prev) => prev,
    refetchInterval: false
  });

  const { data: gstr1Report, isFetching: isFetchingGstr } = useQuery({
    queryKey: ['gstr1Report', currentParams.gstr],
    queryFn: async () => {
      const res = await api.get('/reports/gstr-1', { params: currentParams.gstr });
      return res.data.data;
    },
    placeholderData: (prev) => prev,
    refetchInterval: false
  });

  // Previous Month Queries
  const { data: prevSalesReport } = useQuery({
    queryKey: ['salesReport', prevParams.sales],
    queryFn: async () => {
      const res = await api.get('/reports/sales', { params: prevParams.sales });
      return res.data.data;
    },
    refetchInterval: false
  });

  const { data: prevGstr1Report } = useQuery({
    queryKey: ['gstr1Report', prevParams.gstr],
    queryFn: async () => {
      const res = await api.get('/reports/gstr-1', { params: prevParams.gstr });
      return res.data.data;
    },
    refetchInterval: false
  });

  const { data: company } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const res = await api.get('/company');
      return res.data.data;
    },
    refetchInterval: false
  });

  const summary = salesReport?.summary || {};
  const prevSummary = prevSalesReport?.summary || {};

  const handleExportPDF = async () => {
    if (Capacitor.isNativePlatform()) {
      // In a real native PDF flow, we would generate a PDF blob and write it via Filesystem.
      // Since window.print() is used for web, we will alert the user for now 
      // or ideally use @capacitor-community/printer. But we are setting up generic Share below.
      showAlert({
        title: 'Native Print',
        message: 'Printing native PDFs requires printer plugins. Use Web view or Excel export for data.',
        variant: 'info'
      });
      return;
    }
    window.print();
  };

  const handleExportExcel = async () => {
    const b2b = gstr1Report?.b2bInvoices || [];
    const b2c = gstr1Report?.b2cInvoices || [];
    const all = [...b2b, ...b2c];

    const data = all.map(inv => {
      const customer = (inv.customerSnapshot?.companyName || inv.customerSnapshot?.name || '');
      const gstin = (inv.customerSnapshot?.gstin || '');
      const cgst = inv.cgstTotal || (inv.igstTotal ? inv.igstTotal / 2 : 0);
      const sgst = inv.sgstTotal || (inv.igstTotal ? inv.igstTotal / 2 : 0);
      return {
        'Invoice Number': inv.invoiceNumber,
        'Customer Name': customer,
        'GSTIN': gstin,
        'Invoice Date': inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-IN') : '',
        'Taxable Amount': inv.subtotal || 0,
        'CGST': cgst,
        'SGST': sgst,
        'IGST': 0,
        'Grand Total': inv.grandTotal || 0
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GSTR1 Data");
    
    const monthName = new Date(selectedDate.year, selectedDate.month).toLocaleString('default', { month: 'short' });
    const fileName = `GSTR1_Sales_Report_${monthName}_${selectedDate.year}.xlsx`;
    
    if (Capacitor.isNativePlatform()) {
      try {
        const base64Data = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });
        await Share.share({
          title: fileName,
          text: 'Here is the exported GSTR1 Sales Report.',
          url: result.uri,
          dialogTitle: 'Save or Share Excel Report'
        });
      } catch (err) {
        console.error('File export error:', err);
        showAlert({ title: 'Export Failed', message: 'Could not export Excel file on device.', variant: 'danger' });
      }
    } else {
      XLSX.writeFile(wb, fileName);
    }
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    setSelectedDate(prev => ({ ...prev, month: newMonth }));
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    setSelectedDate(prev => ({ ...prev, year: newYear }));
  };

  const isFetching = isFetchingSales || isFetchingGstr;

  return (
    <>
      <div className={`space-y-6 antialiased print:hidden ${isFetching ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity duration-300'}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Business & Tax Reports</h1>
            <p className="text-xs text-slate-500 mt-0.5">Performance analytics, tax liabilities, and GSTR-1 return data</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Period Selector */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Select 
                value={selectedDate.month} 
                onChange={handleMonthChange}
                containerClassName="w-full sm:w-36"
                className="py-1.5 min-h-[36px]"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </Select>
              <Select 
                value={selectedDate.year} 
                onChange={handleYearChange}
                containerClassName="w-full sm:w-28"
                className="py-1.5 min-h-[36px]"
              >
                {Array.from({ length: 5 }).map((_, i) => {
                  const year = new Date().getFullYear() - i + 1;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </Select>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 whitespace-nowrap bg-white">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel
              </Button>
              <Button variant="primary" size="sm" onClick={handleExportPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white whitespace-nowrap">
                <Printer className="w-4 h-4" /> PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-slate-200/80 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
              <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{formatCurrency(summary.totalRevenue || 0)}</p>
              <TrendIndicator current={summary.totalRevenue} previous={prevSummary.totalRevenue} />
            </div>
          </Card>
          
          <Card className="p-5 border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CGST Collected</span>
            <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{formatCurrency(summary.totalCgst || 0)}</p>
            <TrendIndicator current={summary.totalCgst} previous={prevSummary.totalCgst} />
          </Card>
          
          <Card className="p-5 border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SGST Collected</span>
            <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{formatCurrency(summary.totalSgst || 0)}</p>
            <TrendIndicator current={summary.totalSgst} previous={prevSummary.totalSgst} />
          </Card>
          
          <Card className="p-5 border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IGST Collected</span>
            <p className="text-2xl font-bold text-slate-400 mt-1.5 tracking-tight">—</p>
            <div className="text-[11px] mt-1.5 font-medium text-slate-400">No interstate sales</div>
          </Card>
        </div>

        {/* GSTR-1 Section */}
        <Card className="p-6 border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-orange-600" /> GSTR-1 Return Filing Data
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Summary of B2B and B2C invoices for {new Date(selectedDate.year, selectedDate.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex-1 sm:flex-none flex items-center justify-center whitespace-nowrap text-xs h-8 bg-white">
                <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600" /> Download Data
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1.5">
              <h4 className="text-sm font-semibold text-slate-900">B2B Invoices (With GSTIN)</h4>
              <p className="text-xs text-slate-500">Total B2B Count: <span className="font-mono font-semibold text-slate-800">{gstr1Report?.b2bInvoices?.length || 0}</span></p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(gstr1Report?.totalB2B || 0)}</p>
              <TrendIndicator current={gstr1Report?.totalB2B} previous={prevGstr1Report?.totalB2B} />
            </div>

            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1.5">
              <h4 className="text-sm font-semibold text-slate-900">B2C Invoices (Retail / Consumer)</h4>
              <p className="text-xs text-slate-500">Total B2C Count: <span className="font-mono font-semibold text-slate-800">{gstr1Report?.b2cInvoices?.length || 0}</span></p>
              <p className="text-2xl font-bold text-orange-600 mt-2">{formatCurrency(gstr1Report?.totalB2C || 0)}</p>
              <TrendIndicator current={gstr1Report?.totalB2C} previous={prevGstr1Report?.totalB2C} />
            </div>
          </div>
        </Card>
      </div>

      {/* Clean PDF Printable Component */}
      <ReportPrintable 
        salesReport={salesReport} 
        gstr1Report={gstr1Report} 
        company={company} 
        selectedDate={selectedDate}
      />
    </>
  );
}
