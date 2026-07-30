import React from 'react';
import { formatDate } from '@/lib/utils';

export function ChallanPrintable({ challan, company }) {
  if (!challan) return null;

  const items = challan.items || [];
  const minRows = 6;
  const dummyRowsCount = Math.max(0, minRows - items.length);

  return (
    <div className="printable-document bg-white text-black p-6 max-w-4xl mx-auto text-xs font-sans shadow-lg print:shadow-none print:p-0 print:border-none border border-gray-400 select-none">
      
      {/* Top Banner Title */}
      <div className="text-center border-b-2 border-black pb-1 mb-2">
        <h2 className="text-sm font-bold tracking-widest text-gray-800 uppercase">DELIVERY CHALLAN</h2>
      </div>

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
          <div className="w-3/4 text-center pr-12">
            <h1 className="text-2xl font-black tracking-tight text-red-700 uppercase font-serif">
              {company?.companyName || 'CORE PACK INDIA'}
            </h1>
            <p className="font-bold text-red-600 text-[11px] uppercase tracking-wider">
              {company?.tagline || 'MFG. : WOODEN PACKING BOXES & CORRUGATED BOX'}
            </p>
            <p className="text-[10px] text-gray-800 leading-tight mt-0.5">
              OFFICE: {company?.address?.street || "B. N. D'souza Compound, Survey No. 21, Opp. Cafe Faizan Hotel, Khairani Road, Sakinaka, Mumbai - 72."}
            </p>
            <p className="text-[10px] text-gray-800 leading-tight">
              WORKS : Deslepada, Bhopar Road, Opp. Church, Dombivli (E) 421 204.
            </p>
            <p className="text-[10px] text-gray-800 leading-tight font-medium">
              Email: {company?.email || 'corepackindia@gmail.com'} | GSTIN: {company?.gstin || '27AMSPK9622Q1ZZ'}
            </p>
          </div>
        </div>
      </div>

      {/* Customer / Consignee & Challan Info Grid */}
      <div className="border border-black mb-3 text-[11px]">
        <div className="grid grid-cols-12 divide-x divide-black border-b border-black">
          {/* M/s Customer Details */}
          <div className="col-span-8 p-3 space-y-1">
            <div className="flex items-start">
              <span className="font-bold w-10 shrink-0">M/s.</span>
              <div className="font-bold text-black uppercase">
                {challan.customerSnapshot?.companyName || challan.customerSnapshot?.name}
              </div>
            </div>
            <div className="pl-10 text-gray-800 leading-relaxed">
              <p>{challan.customerSnapshot?.shippingAddress?.street || challan.customerSnapshot?.billingAddress?.street || challan.customerSnapshot?.address}</p>
              <p>{challan.customerSnapshot?.shippingAddress?.city || challan.customerSnapshot?.billingAddress?.city || ''} {challan.customerSnapshot?.shippingAddress?.state || challan.customerSnapshot?.billingAddress?.state || ''}</p>
              {challan.customerSnapshot?.gstin && (
                <p className="font-mono text-[10px] pt-1"><span className="font-bold">GSTIN:</span> {challan.customerSnapshot.gstin}</p>
              )}
            </div>
          </div>

          {/* Challan No, Date, Vehicle Specs */}
          <div className="col-span-4 p-3 space-y-1.5 bg-gray-50/50">
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span className="font-bold">Challan No. :</span>
              <span className="font-bold font-mono text-black">{challan.challanNumber}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-1">
              <span className="font-bold">Date :</span>
              <span>{formatDate(challan.challanDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Vehicle No. :</span>
              <span className="font-mono uppercase">{challan.vehicleNo || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Goods Order Condition Sub-banner */}
        <div className="py-1 text-center font-semibold italic text-[10.5px] bg-gray-100 text-gray-800">
          {company?.challanBannerText || 'Please receive the following goods in good order & condition.'}
        </div>
      </div>

      {/* Line Items Table */}
      <table className="w-full border border-black mb-6 text-[11px] border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-black font-bold uppercase text-[10.5px] text-center divide-x divide-black">
            <th className="py-2 px-1 w-12">S.No.</th>
            <th className="py-2 px-3 text-left">PARTICULARS</th>
            <th className="py-2 px-2 w-32">QUANTITY</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300 border-b border-black">
          {items.map((item, idx) => (
            <tr key={idx} className="divide-x divide-black align-top min-h-[40px]">
              <td className="py-2 px-1 text-center font-medium">{idx + 1}</td>
              <td className="py-2 px-3 font-semibold text-black">
                <div>{item.name}</div>
                {item.remarks && <div className="text-[10px] text-gray-600 font-normal mt-0.5">{item.remarks}</div>}
              </td>
              <td className="py-2 px-2 text-center font-bold text-sm">
                {item.qty} <span className="text-xs font-normal text-gray-700">{item.unit || 'Pcs'}</span>
              </td>
            </tr>
          ))}

          {/* Dummy Empty Rows for Spacing */}
          {Array.from({ length: dummyRowsCount }).map((_, i) => (
            <tr key={`dummy-${i}`} className="divide-x divide-black h-10">
              <td className="py-1"></td>
              <td className="py-1"></td>
              <td className="py-1"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signature Footer */}
      <div className="pt-12 pb-4 flex justify-between items-end">
        <div className="text-center w-48 border-t border-black pt-1.5">
          <p className="font-bold text-black text-[11px]">Receiver's Signature</p>
        </div>

        <div className="text-center space-y-10">
          <p className="font-bold text-red-700 uppercase text-[11px]">
            For {company?.companyName || 'CORE PACK INDIA'}
          </p>
          <div className="border-t border-black pt-1.5 w-56 mx-auto">
            <p className="font-bold text-black text-[11px]">Proprietor / Authorised Signatory</p>
          </div>
        </div>
      </div>

    </div>
  );
}
