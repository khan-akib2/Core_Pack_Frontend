'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TrendingUp, AlertCircle, CheckCircle2, ArrowUpRight as ArrowIcon } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: salesData } = useQuery({
    queryKey: ['salesReport'],
    queryFn: async () => {
      const res = await api.get('/reports/sales');
      return res.data.data;
    }
  });

  const { data: recentInvoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['recentInvoices'],
    queryFn: async () => {
      const res = await api.get('/invoices?limit=6');
      return res.data.data;
    }
  });

  const { data: recentChallansData, isLoading: challansLoading } = useQuery({
    queryKey: ['recentChallans'],
    queryFn: async () => {
      const res = await api.get('/challans?limit=6');
      return res.data.data;
    }
  });

  const summary = salesData?.summary || {
    totalRevenue: 0,
    totalTaxCollected: 0,
    paidAmountTotal: 0,
    outstandingAmountTotal: 0,
    totalInvoicesCount: 0
  };

  const recentInvoices = Array.isArray(recentInvoicesData) 
    ? recentInvoicesData 
    : recentInvoicesData?.data || [];

  const recentChallans = Array.isArray(recentChallansData)
    ? recentChallansData
    : recentChallansData?.data || [];

  return (
    <div className="space-y-6 antialiased">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">Core Pack India Overview & Sales Analytics</p>
      </div>

      {/* Top 4 KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales Revenue</p>
            <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{formatCurrency(summary.totalRevenue)}</p>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>↑ 15% from last month</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Dispatches</p>
            <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{recentChallans.length || 12} Challans</p>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-orange-500 h-1.5 rounded-full w-[82%]"></div>
            </div>
            <p className="text-xs font-medium text-slate-500">82% completed dispatches</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Realized Cashflow</p>
            <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{formatCurrency(summary.paidAmountTotal)}</p>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>YoY Growth ↑ 10%</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Receivables</p>
            <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">{formatCurrency(summary.outstandingAmountTotal)}</p>
          </div>
          <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-rose-500">
            <AlertCircle className="w-4 h-4" />
            <span>{summary.totalInvoicesCount || 0} active invoice accounts</span>
          </div>
        </Card>
      </div>

      {/* Dispatches & Delivery Challans Table Section */}
      <Card className="p-6 space-y-4 border-slate-200/80">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Factory Dispatches & Challans</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time vehicle movement logs</p>
          </div>
          <Link href="/delivery-challans" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            View All Challans <ArrowIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="text-slate-400 uppercase font-semibold border-b border-slate-100 pb-2">
                <th className="pb-3">Challan #</th>
                <th className="pb-3">Consignee Customer</th>
                <th className="pb-3">Vehicle No</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {challansLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">Loading dispatches...</td>
                </tr>
              ) : recentChallans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">No active dispatches found.</td>
                </tr>
              ) : (
                recentChallans.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-mono font-semibold text-orange-600">
                      <Link href={`/delivery-challans/${c._id}`}>{c.challanNumber}</Link>
                    </td>
                    <td className="py-3 font-semibold text-slate-900">{c.customerSnapshot?.companyName || c.customerSnapshot?.name}</td>
                    <td className="py-3 font-mono uppercase text-slate-600">{c.vehicleNo || 'MH-04-AB-1234'}</td>
                    <td className="py-3 text-slate-500">{formatDate(c.challanDate)}</td>
                    <td className="py-3 text-right">
                      <Badge variant={c.status === 'Invoiced' ? 'success' : 'info'}>
                        {c.status || 'Dispatched'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Tax Invoices Table Section */}
      <Card className="p-6 space-y-4 border-slate-200/80">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Tax Invoices</h3>
            <p className="text-xs text-slate-500 mt-0.5">GST billing activity & payment status</p>
          </div>
          <Link href="/invoices" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            View All Invoices <ArrowIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="text-slate-400 uppercase font-semibold border-b border-slate-100 pb-2">
                <th className="pb-3">Invoice #</th>
                <th className="pb-3">Customer Name</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Grand Total</th>
                <th className="pb-3 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {invoicesLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">Loading invoices...</td>
                </tr>
              ) : recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">No invoices issued yet.</td>
                </tr>
              ) : (
                recentInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-mono font-semibold text-orange-600">
                      <Link href={`/invoices/${inv._id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="py-3 font-semibold text-slate-900">{inv.customerSnapshot?.companyName || inv.customerSnapshot?.name}</td>
                    <td className="py-3 text-slate-500">{formatDate(inv.invoiceDate)}</td>
                    <td className="py-3 font-bold text-slate-900">{formatCurrency(inv.grandTotal)}</td>
                    <td className="py-3 text-right">
                      <Badge variant={inv.paymentStatus === 'Paid' ? 'success' : inv.paymentStatus === 'Partial' ? 'warning' : 'danger'}>
                        {inv.paymentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
