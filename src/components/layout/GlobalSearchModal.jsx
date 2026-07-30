'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, FileText, Package, Users, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const navigateTo = (path) => {
    router.push(path);
    onClose(); 
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800"
      >
        <div className="p-4 border-b border-slate-200 flex items-center space-x-3 bg-slate-50">
          <Search className="w-5 h-5 text-orange-500 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search Invoices, Products, Customers, Quotes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-slate-900 placeholder-slate-400 focus:outline-none text-base font-medium"
          />
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {loading && <p className="text-sm text-slate-500 text-center py-6">Searching Database...</p>}

          {!loading && results && (
            <>
              {results.invoices?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Tax Invoices
                  </h4>
                  <div className="space-y-1">
                    {results.invoices.map((inv) => (
                      <div
                        key={inv._id}
                        onClick={() => navigateTo(`/invoices/${inv._id}`)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{inv.invoiceNumber}</p>
                          <p className="text-xs text-slate-500">{inv.customerSnapshot?.companyName || inv.customerSnapshot?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-orange-600">{formatCurrency(inv.grandTotal)}</p>
                          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">{inv.paymentStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.products?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Package className="w-4 h-4" /> Product Catalog
                  </h4>
                  <div className="space-y-1">
                    {results.products.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => navigateTo(`/products`)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{p.name}</p>
                          <p className="text-xs text-slate-500">SKU: {p.sku} | HSN: {p.hsnCode}</p>
                        </div>
                        <p className="text-sm font-black text-emerald-600">{formatCurrency(p.defaultRate)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.customers?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Clients & Customers
                  </h4>
                  <div className="space-y-1">
                    {results.customers.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => navigateTo(`/customers`)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{c.companyName || c.name}</p>
                          <p className="text-xs text-slate-500">GST: {c.gstin || 'Unregistered'}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.invoices?.length === 0 && results.products?.length === 0 && results.customers?.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-6">No matching records found.</p>
              )}
            </>
          )}

          {!loading && !results && query.length < 2 && (
            <p className="text-xs text-slate-400 text-center py-4">Type at least 2 characters to search across database...</p>
          )}
        </div>
      </div>
    </div>
  );
}
