import React from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';

export function QuotationPrintable({ quotation, company }) {
  if (!quotation) return null;

  return (
    <div className="printable-document bg-white text-black p-6 max-w-4xl mx-auto text-xs font-sans shadow-lg print:shadow-none print:p-0 print:border-none border border-gray-400 select-none">
      
      {/* Header with Core Pack Logo & Company Details */}
      <div className="border-b-2 border-black pb-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="w-1/4">
            <img 
              src="/logo.png" 
              alt="Core Pack India Logo" 
              className="h-16 max-w-full object-contain"
            />
          </div>
          <div className="w-2/4 text-center">
            <h1 className="text-2xl font-black tracking-tight text-red-700 uppercase font-serif">
              {company?.companyName || 'CORE PACK INDIA'}
            </h1>
            <p className="font-bold text-red-600 text-[11px] uppercase tracking-wider">
              {company?.tagline || 'MFG. : WOODEN PACKING BOXES & CORRUGATED BOX'}
            </p>
            <p className="text-[10px] text-gray-800 leading-tight mt-0.5">
              Office : {company?.address?.street || "B.N. D'souza Compound, Survey No. 21, Opp. Cafe Faizan Hotel, Khairani Road, Sakinaka, Mumbai - 72."}
            </p>
            <p className="text-[10px] text-gray-800 leading-tight">
              Works : Deslepada, Bhopar Road, Opp. Church, Dombivli (E) 421204.
            </p>
            <p className="text-[10px] text-gray-800 leading-tight font-medium">
              E-mail: {company?.email || 'corepackindia@gmail.com'} | GSTIN: {company?.gstin || '27AMSPK9622Q1ZZ'}
            </p>
          </div>
          <div className="w-1/4 text-right">
            <span className="inline-block bg-amber-500 text-black font-extrabold px-3 py-1 text-xs tracking-wider uppercase mb-1 rounded border border-black">
              QUOTATION
            </span>
            <p className="font-bold text-sm text-black font-mono"># {quotation.quoteNumber}</p>
            <p className="text-[10.5px] text-gray-800"><strong>Date:</strong> {formatDate(quotation.quoteDate)}</p>
            <p className="text-[10.5px] text-gray-800"><strong>Valid Until:</strong> {formatDate(quotation.validUntil)}</p>
          </div>
        </div>
      </div>

      <div className="mb-3 p-2.5 bg-gray-50 border border-black rounded text-[11px]">
        <h3 className="font-bold uppercase text-black border-b border-gray-300 pb-0.5 mb-1">Quotation For:</h3>
        <p className="font-bold text-sm text-black">{quotation.customerSnapshot?.companyName || quotation.customerSnapshot?.name}</p>
        <p className="text-gray-800">{quotation.customerSnapshot?.billingAddress?.street || quotation.customerSnapshot?.address}, {quotation.customerSnapshot?.billingAddress?.city || ''}</p>
        <p className="text-gray-800"><span className="font-bold">GSTIN:</span> {quotation.customerSnapshot?.gstin || 'N/A'} | <span className="font-bold">Phone:</span> {quotation.customerSnapshot?.phone}</p>
      </div>

      <table className="w-full border-collapse border border-black mb-3 text-[11px]">
        <thead>
          <tr className="bg-gray-100 text-black font-bold uppercase text-[10px] text-center border-b border-black">
            <th className="border border-black p-1.5 w-10">#</th>
            <th className="border border-black p-1.5 text-left">Item Specification</th>
            <th className="border border-black p-1.5 w-20">HSN</th>
            <th className="border border-black p-1.5 w-16 text-right">Qty</th>
            <th className="border border-black p-1.5 w-24 text-right">Unit Rate</th>
            <th className="border border-black p-1.5 w-28 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {quotation.items?.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-300">
              <td className="border border-black p-1.5 text-center font-medium">{idx + 1}</td>
              <td className="border border-black p-1.5 font-semibold text-black">{item.name}</td>
              <td className="border border-black p-1.5 text-center font-mono text-[10px]">{item.hsnCode}</td>
              <td className="border border-black p-1.5 text-right font-bold">{item.qty} {item.unit}</td>
              <td className="border border-black p-1.5 text-right font-mono">{formatCurrency(item.rate)}</td>
              <td className="border border-black p-1.5 text-right font-mono font-bold">{formatCurrency(item.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-start mb-4 text-[11px]">
        <div className="w-1/2 pr-4">
          <div className="p-2.5 bg-gray-50 border border-black rounded">
            <p className="font-bold text-black">Total in Words:</p>
            <p className="font-medium text-gray-800 italic">{quotation.amountInWords}</p>
          </div>
        </div>
        <div className="w-1/2 pl-4 text-right space-y-1">
          <div className="flex justify-between text-gray-700">
            <span>Sub Total:</span>
            <span className="font-semibold font-mono text-black">{formatCurrency(quotation.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Estimated Tax (GST):</span>
            <span className="font-semibold font-mono text-black">{formatCurrency((quotation.cgstTotal || 0) + (quotation.sgstTotal || 0) + (quotation.igstTotal || 0))}</span>
          </div>
          <div className="flex justify-between text-sm font-black border-t-2 border-black pt-1 mt-1 text-black">
            <span>Grand Total:</span>
            <span className="font-mono">{formatCurrency(quotation.grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-black pt-3 flex justify-between items-end mt-6">
        <div className="text-gray-700 max-w-xs text-[9.5px]">
          <p className="font-bold text-black text-[10px]">Terms & Conditions:</p>
          <p className="whitespace-pre-line leading-tight">{quotation.terms}</p>
        </div>
        <div className="text-center space-y-8">
          <p className="font-bold text-red-700 uppercase text-[10px]">For CORE PACK INDIA</p>
          <p className="border-t border-black pt-1 text-black font-bold text-[10px]">Authorised Signatory</p>
        </div>
      </div>
    </div>
  );
}
