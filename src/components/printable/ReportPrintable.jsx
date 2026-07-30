import React from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';

export function ReportPrintable({ salesReport, gstr1Report, company }) {
  const summary = salesReport?.summary || {};
  const invoices = salesReport?.invoices || [];

  return (
    <div className="printable-document hidden print:block bg-white text-slate-900 p-8 max-w-5xl mx-auto text-xs font-sans">
      {/* Printable Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">CORE PACK INDIA</h1>
          <p className="text-xs text-slate-600 font-medium">Manufacturers of Wooden & Corrugated Packaging Solutions</p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">GSTIN: {company?.gstin || '27AABCC1234D1Z5'}</p>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-sm font-bold text-orange-600 uppercase tracking-widest">GST & Sales Tax Report</h2>
          <p className="text-xs text-slate-600 font-semibold">Period: {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</p>
          <p className="text-[10px] text-slate-400">Generated on: {formatDate(new Date())}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-3 border border-slate-300 rounded-lg text-center bg-slate-50">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Sales Subtotal</span>
          <span className="text-sm font-bold text-slate-900">{formatCurrency(summary.totalRevenue || 0)}</span>
        </div>
        <div className="p-3 border border-slate-300 rounded-lg text-center bg-slate-50">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">CGST Collected</span>
          <span className="text-sm font-bold text-slate-900">{formatCurrency(summary.totalCgst || 0)}</span>
        </div>
        <div className="p-3 border border-slate-300 rounded-lg text-center bg-slate-50">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">SGST Collected</span>
          <span className="text-sm font-bold text-slate-900">{formatCurrency(summary.totalSgst || 0)}</span>
        </div>
        <div className="p-3 border border-slate-300 rounded-lg text-center bg-slate-50">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">IGST Collected</span>
          <span className="text-sm font-bold text-slate-900">—</span>
        </div>
      </div>

      {/* Invoice Breakdown Table */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-300 pb-1">
          Tax Invoice Ledger ({invoices.length} Invoices)
        </h3>
        <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              <th className="p-2 border-r border-slate-300">Invoice No</th>
              <th className="p-2 border-r border-slate-300">Date</th>
              <th className="p-2 border-r border-slate-300">Customer Name</th>
              <th className="p-2 border-r border-slate-300">GSTIN</th>
              <th className="p-2 border-r border-slate-300 text-right">Taxable Subtotal</th>
              <th className="p-2 border-r border-slate-300 text-right">CGST</th>
              <th className="p-2 border-r border-slate-300 text-right">SGST</th>
              <th className="p-2 border-r border-slate-300 text-right">IGST</th>
              <th className="p-2 text-right">Grand Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-4 text-center text-slate-400 font-sans">No invoices found for this period.</td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const cgst = inv.cgstTotal || (inv.igstTotal ? inv.igstTotal / 2 : 0);
                const sgst = inv.sgstTotal || (inv.igstTotal ? inv.igstTotal / 2 : 0);
                return (
                  <tr key={inv._id} className="hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-200 font-bold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-600 font-sans">{formatDate(inv.invoiceDate)}</td>
                    <td className="p-2 border-r border-slate-200 font-sans font-semibold text-slate-800">
                      {inv.customerSnapshot?.companyName || inv.customerSnapshot?.name || 'Walk-in Client'}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-slate-600">{inv.customerSnapshot?.gstin || 'Unregistered'}</td>
                    <td className="p-2 border-r border-slate-200 text-right">{formatCurrency(inv.subtotal || 0)}</td>
                    <td className="p-2 border-r border-slate-200 text-right text-slate-700">{formatCurrency(cgst)}</td>
                    <td className="p-2 border-r border-slate-200 text-right text-slate-700">{formatCurrency(sgst)}</td>
                    <td className="p-2 border-r border-slate-200 text-right text-slate-400">—</td>
                    <td className="p-2 text-right font-bold text-slate-900">{formatCurrency(inv.grandTotal || 0)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-slate-900 font-bold text-slate-900 text-xs">
              <td colSpan={4} className="p-2.5 border-r border-slate-300 uppercase tracking-wider text-right font-sans">Total Accumulation:</td>
              <td className="p-2.5 border-r border-slate-300 text-right font-mono">{formatCurrency(summary.totalRevenue || 0)}</td>
              <td className="p-2.5 border-r border-slate-300 text-right font-mono">{formatCurrency(summary.totalCgst || 0)}</td>
              <td className="p-2.5 border-r border-slate-300 text-right font-mono">{formatCurrency(summary.totalSgst || 0)}</td>
              <td className="p-2.5 border-r border-slate-300 text-right font-mono text-slate-400">—</td>
              <td className="p-2.5 text-right font-mono text-orange-600 font-bold">{formatCurrency(summary.grandTotalSum || 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer Statement */}
      <div className="border-t border-slate-300 pt-4 mt-8 flex items-center justify-between text-[10px] text-slate-500">
        <p>Core Pack India — Official GST Sales Return Statement</p>
        <p>Page 1 of 1</p>
      </div>
    </div>
  );
}
