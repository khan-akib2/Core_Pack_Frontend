import React from 'react';
import { formatDate } from '@/lib/utils';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

function numberToWords(num) {
  if (!num || isNaN(num) || num === 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  }

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let words = inWords(integerPart) + ' Rupees';
  if (decimalPart > 0) {
    words += ' and ' + inWords(decimalPart) + ' Paise';
  }
  return words + ' Only';
}

function CorePackLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* 3D Cube Icon */}
      <div className="w-16 h-16 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Top Navy Face */}
          <polygon points="50,12 88,32 50,52 12,32" fill="#001F54" />
          {/* Left Orange Face */}
          <polygon points="12,32 50,52 50,90 12,70" fill="#F26522" />
          {/* Right Navy Face */}
          <polygon points="50,52 88,32 88,70 50,90" fill="#001F54" opacity="0.9" />
          {/* Inner Orange Box Details */}
          <polygon points="28,40 50,51 72,40 50,29" fill="#FFFFFF" opacity="0.25" />
          <polygon points="32,49 50,58 50,80 32,71" fill="#F26522" />
          <polygon points="50,58 68,49 68,71 50,80" fill="#001F54" opacity="0.8" />
        </svg>
      </div>

      {/* Logo Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="text-2.5xl text-2xl font-black text-[#001F54] tracking-tight uppercase font-sans">CORE</span>
          <span className="text-2.5xl text-2xl font-black text-[#F26522] tracking-tight uppercase font-sans">PACK</span>
        </div>

        {/* Horizontal Line with INDIA */}
        <div className="flex items-center gap-2 my-1">
          <div className="h-[1.5px] bg-[#001F54] flex-1"></div>
          <span className="text-[11px] font-bold text-[#001F54] tracking-[0.25em] uppercase font-sans">INDIA</span>
          <div className="h-[1.5px] bg-[#001F54] flex-1"></div>
        </div>

        {/* Subtitle */}
        <p className="text-[10px] font-bold text-[#001F54] tracking-tight font-sans whitespace-nowrap">
          Wooden & Corrugated Solutions
        </p>
      </div>
    </div>
  );
}

export function InvoicePrintable({ invoice, company }) {
  if (!invoice) return null;

  // Split decimal into Rupees and Paise
  const formatRsPs = (val) => {
    if (val === undefined || val === null || isNaN(val) || val === '') {
      return { rs: '—', ps: '—' };
    }
    const num = Number(val);
    const rs = Math.floor(num).toLocaleString('en-IN');
    const ps = Math.round((num - Math.floor(num)) * 100).toString().padStart(2, '0');
    return { rs, ps };
  };

  const items = invoice.items || [];
  const minRows = 8;
  const dummyRowsCount = Math.max(0, minRows - items.length);

  const subtotal = Number(invoice.subtotal || 0);
  const transportCharges = Number(invoice.transportationCharges || 0);
  const amountBeforeTax = subtotal + transportCharges;

  // Tax calculations
  const firstItemTaxRate = items[0]?.taxRate || 5;
  const cgstRatePercent = invoice.isInterstate ? 0 : (firstItemTaxRate / 2);
  const sgstRatePercent = invoice.isInterstate ? 0 : (firstItemTaxRate / 2);
  const igstRatePercent = invoice.isInterstate ? firstItemTaxRate : 0;

  const cgstVal = invoice.cgstTotal !== undefined ? Number(invoice.cgstTotal) : (invoice.isInterstate ? 0 : subtotal * (cgstRatePercent / 100));
  const sgstVal = invoice.sgstTotal !== undefined ? Number(invoice.sgstTotal) : (invoice.isInterstate ? 0 : subtotal * (sgstRatePercent / 100));
  const igstVal = invoice.igstTotal !== undefined ? Number(invoice.igstTotal) : (invoice.isInterstate ? subtotal * (igstRatePercent / 100) : 0);
  const totalGst = cgstVal + sgstVal + igstVal;
  const grandTotal = Number(invoice.grandTotal || (amountBeforeTax + totalGst));

  const words = invoice.amountInWords || numberToWords(grandTotal);

  const custName = invoice.customerSnapshot?.companyName || invoice.customerSnapshot?.name || '—';
  const custAddress = [
    invoice.customerSnapshot?.billingAddress?.street || invoice.customerSnapshot?.address,
    invoice.customerSnapshot?.billingAddress?.city,
    invoice.customerSnapshot?.billingAddress?.pincode
  ].filter(Boolean).join(', ');

  const compAddress = company?.address?.street || "B.N. D'souza Compound, Survey No. 21, Sakinaka, Mumbai - 72";

  return (
    <div className="printable-document bg-white text-black p-4 max-w-[850px] mx-auto text-[11px] font-sans relative print:p-0 print:border-none print:shadow-none select-none border border-gray-300">

      {/* Header Container */}
      <div className="relative pt-1 pb-1">
        {/* Top Horizontal Orange Accent Line */}
        <div className="h-[2.5px] bg-[#F26522] w-full mb-2"></div>

        {/* Top Right Corner Dark Navy Accent Polygon */}
        <div className="absolute top-0 right-0 w-36 h-10 overflow-hidden pointer-events-none">
          <div
            className="bg-[#001F54] w-48 h-16"
            style={{ clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 0 100%)' }}
          ></div>
        </div>

        <div className="flex justify-between items-center relative z-10 px-2 min-h-[90px]">
          {/* Left Section: Crisp Vector Logo */}
          <div className="w-[45%] shrink-0 pr-2">
            <CorePackLogo />
          </div>

          {/* Diagonal Orange Divider Line */}
          <div className="relative self-stretch flex items-center">
            <svg className="h-full w-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 30 100">
              <line x1="5" y1="95" x2="25" y2="5" stroke="#F26522" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Right Section: Contact Info (padded right to prevent overlap with top-right navy shape) */}
          <div className="w-[52%] pl-2 pr-12 space-y-1.5 text-[10px]">
            <div className="flex items-center gap-2 border-b border-gray-300 pb-0.5">
              <div className="w-4 h-4 rounded-full bg-[#F26522] flex items-center justify-center shrink-0">
                <MapPin className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="font-bold text-[#001F54] shrink-0">Address :</span>
              <span className="truncate text-gray-800 font-medium">{compAddress}</span>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-300 pb-0.5">
              <div className="w-4 h-4 rounded-full bg-[#F26522] flex items-center justify-center shrink-0">
                <Phone className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="font-bold text-[#001F54] shrink-0">Mobile :</span>
              <span className="truncate text-gray-800 font-medium">{company?.phone || '8851000041 / 9324540077'}</span>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-300 pb-0.5">
              <div className="w-4 h-4 rounded-full bg-[#F26522] flex items-center justify-center shrink-0">
                <Mail className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="font-bold text-[#001F54] shrink-0">Email :</span>
              <span className="truncate text-gray-800 font-medium">{company?.email || 'corepackindia@gmail.com'}</span>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-300 pb-0.5">
              <div className="w-4 h-4 rounded-full bg-[#F26522] flex items-center justify-center shrink-0">
                <Globe className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="font-bold text-[#001F54] shrink-0">GSTIN :</span>
              <span className="truncate text-gray-900 font-bold font-mono">{company?.gstin || '27AMSPK9622Q1ZZ'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Horizontal Orange Accent Line */}
        <div className="h-[2.5px] bg-[#F26522] w-full mt-2 mb-2"></div>
      </div>

      {/* Centered INVOICE Banner */}
      <div className="my-2 flex justify-center">
        <div className="bg-[#001F54] text-white px-16 py-1 rounded-full font-bold text-sm tracking-widest uppercase text-center shadow-sm">
          INVOICE
        </div>
      </div>

      {/* Main Outer Boxed Frame */}
      <div className="border-2 border-[#001F54] rounded-sm overflow-hidden bg-white">

        {/* Receiver Details & Invoice Metadata Container */}
        <div className="grid grid-cols-12 border-b-2 border-[#001F54]">

          {/* Left Column: Receiver / Billed To */}
          <div className="col-span-7 p-2 relative pr-3">
            {/* Dark Navy Pill Badge */}
            <div className="inline-block bg-[#001F54] text-white text-[10px] font-bold px-3 py-0.5 rounded-full mb-2">
              Details of Receiver / Billed to
            </div>

            <div className="space-y-1 text-[10.5px]">
              <div className="flex items-baseline border-b border-gray-300 pb-0.5">
                <span className="w-20 font-bold text-[#001F54] shrink-0">Name :</span>
                <span className="font-bold text-black uppercase">{custName}</span>
              </div>

              <div className="flex items-start border-b border-gray-300 pb-0.5 min-h-[36px]">
                <span className="w-20 font-bold text-[#001F54] shrink-0 pt-0.5">Address :</span>
                <span className="text-gray-800 leading-tight font-medium">{custAddress || '—'}</span>
              </div>

              <div className="flex items-baseline border-b border-gray-300 pb-0.5">
                <span className="w-20 font-bold text-[#001F54] shrink-0">GSTIN :</span>
                <span className="font-mono font-bold text-black">{invoice.customerSnapshot?.gstin || 'URP'}</span>
              </div>

              <div className="flex justify-between items-baseline pt-0.5">
                <div className="flex items-baseline w-1/2 border-b border-gray-300 pb-0.5 pr-2">
                  <span className="font-bold text-[#001F54] mr-2">State :</span>
                  <span className="text-gray-800">{invoice.customerSnapshot?.billingAddress?.state || 'Maharashtra'}</span>
                </div>
                <div className="flex items-baseline w-1/2 border-b border-gray-300 pb-0.5 pl-2">
                  <span className="font-bold text-[#001F54] mr-2">State Code :</span>
                  <span className="font-mono text-gray-800">{invoice.customerSnapshot?.billingAddress?.stateCode || '27'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Invoice Metadata */}
          <div className="col-span-5 border-l-2 border-[#001F54] p-2 space-y-1 text-[10.5px]">
            <div className="flex justify-between items-baseline border-b border-gray-300 pb-0.5">
              <span className="font-bold text-[#001F54]">Invoice No. :</span>
              <span className="font-mono font-bold text-black">{invoice.invoiceNumber || '—'}</span>
            </div>

            <div className="flex justify-between items-baseline border-b border-gray-300 pb-0.5">
              <span className="font-bold text-[#001F54]">Invoice Date :</span>
              <span className="font-medium text-gray-800">{formatDate(invoice.invoiceDate)}</span>
            </div>

            <div className="flex justify-between items-baseline border-b border-gray-300 pb-0.5">
              <span className="font-bold text-[#001F54]">Challan No. :</span>
              <span className="font-mono text-gray-800">{invoice.challanNumber || '—'}</span>
            </div>

            <div className="flex justify-between items-baseline border-b border-gray-300 pb-0.5">
              <span className="font-bold text-[#001F54]">Challan Date :</span>
              <span className="font-medium text-gray-800">{invoice.challanDate ? formatDate(invoice.challanDate) : '—'}</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-300 pb-0.5">
              <span className="font-bold text-[#001F54]">Reverse Charge :</span>
              <div className="flex items-center gap-3 text-[10px]">
                <label className="flex items-center gap-1">
                  <span className={`w-3.5 h-3.5 border border-black flex items-center justify-center text-[9px] font-bold ${invoice.isReverseCharge ? 'bg-black text-white' : ''}`}>
                    {invoice.isReverseCharge ? '✓' : ''}
                  </span>
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-1">
                  <span className={`w-3.5 h-3.5 border border-black flex items-center justify-center text-[9px] font-bold ${!invoice.isReverseCharge ? 'bg-black text-white' : ''}`}>
                    {!invoice.isReverseCharge ? '✓' : ''}
                  </span>
                  <span>No</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-0.5">
              <span className="font-bold text-[#001F54]">Vehicle No. :</span>
              <span className="font-mono uppercase font-bold text-black">{invoice.vehicleNo || '—'}</span>
            </div>
          </div>

        </div>

        {/* Line Items Table */}
        <table className="w-full border-collapse">
          <thead>
            {/* Top Table Header Row */}
            <tr className="bg-[#001F54] text-white text-[10px] font-bold uppercase text-center divide-x divide-white">
              <th className="py-1.5 px-1 w-10 border-r border-[#001F54]">Sr.<br />No.</th>
              <th className="py-1.5 px-2 text-left border-r border-[#001F54]">Name of Product / Service</th>
              <th className="py-1.5 px-1 w-20 border-r border-[#001F54]">HSN Code</th>
              <th className="py-1.5 px-1 w-12 border-r border-[#001F54]">Qty</th>
              <th className="py-1.5 px-0 w-28 border-r border-[#001F54]">
                <div>Rate (₹)</div>
                <div className="flex justify-around border-t border-white text-[9px] pt-0.5 mt-0.5 font-normal">
                  <span className="w-1/2 text-center border-r border-white">Rs.</span>
                  <span className="w-1/2 text-center">Ps.</span>
                </div>
              </th>
              <th className="py-1.5 px-0 w-32">
                <div>Amount (₹)</div>
                <div className="flex justify-around border-t border-white text-[9px] pt-0.5 mt-0.5 font-normal">
                  <span className="w-1/2 text-center border-r border-white">Rs.</span>
                  <span className="w-1/2 text-center">Ps.</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="text-[10.5px]">
            {items.map((item, idx) => {
              const rateFmt = formatRsPs(item.rate);
              const amountFmt = formatRsPs(item.taxableAmount || (item.qty * item.rate));
              return (
                <tr key={idx} className="border-b border-gray-300 divide-x divide-[#001F54] text-center align-top min-h-[32px]">
                  <td className="py-1.5 px-1 font-medium">{idx + 1}</td>
                  <td className="py-1.5 px-2 text-left font-semibold text-gray-900">
                    <div>{item.name}</div>
                    {item.description && <div className="text-[9.5px] text-gray-600 font-normal">{item.description}</div>}
                    {(item.boxSize || item.palletSize) && (
                      <div className="text-[9px] text-gray-600 font-medium mt-0.5">
                        {item.boxSize && <span className="mr-2">Box: {item.boxSize}</span>}
                        {item.palletSize && <span>Pallet: {item.palletSize}</span>}
                      </div>
                    )}
                  </td>
                  <td className="py-1.5 px-1 font-mono text-[10px]">{item.hsnCode || '44151000'}</td>
                  <td className="py-1.5 px-1 font-bold">{item.qty}</td>

                  {/* Rate Rs & Ps */}
                  <td className="py-1.5 px-0">
                    <div className="flex justify-between px-1.5 font-mono">
                      <span className="w-1/2 text-right pr-2">{rateFmt.rs}</span>
                      <span className="w-1/2 text-left pl-2 text-gray-600">{rateFmt.ps}</span>
                    </div>
                  </td>

                  {/* Amount Rs & Ps */}
                  <td className="py-1.5 px-0">
                    <div className="flex justify-between px-1.5 font-mono font-semibold">
                      <span className="w-1/2 text-right pr-2">{amountFmt.rs}</span>
                      <span className="w-1/2 text-left pl-2 text-gray-600">{amountFmt.ps}</span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty Filler Rows */}
            {Array.from({ length: dummyRowsCount }).map((_, i) => (
              <tr key={`dummy-${i}`} className="border-b border-gray-200 divide-x divide-[#001F54] h-8">
                <td className="py-1"></td>
                <td className="py-1"></td>
                <td className="py-1"></td>
                <td className="py-1"></td>
                <td className="py-1">
                  <div className="flex justify-between px-1.5 text-transparent">
                    <span className="w-1/2 text-right border-r border-transparent">.</span>
                    <span className="w-1/2 text-left">.</span>
                  </div>
                </td>
                <td className="py-1">
                  <div className="flex justify-between px-1.5 text-transparent">
                    <span className="w-1/2 text-right border-r border-transparent">.</span>
                    <span className="w-1/2 text-left">.</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer & Totals Container Grid */}
        <div className="grid grid-cols-12 border-t-2 border-[#001F54]">

          {/* Left Footer Column: Amount in Words, Bank Details, Terms & Conditions, Stamp */}
          <div className="col-span-7 p-2 flex flex-col justify-between space-y-2 border-r-2 border-[#001F54]">

            {/* Amount in Words */}
            <div className="space-y-0.5">
              <div className="font-bold text-[#001F54] text-[10.5px]">
                Amount in Words :
              </div>
              <div className="border-b border-gray-300 pb-0.5 text-[10px] font-bold italic text-gray-900">
                {words}
              </div>
              <div className="border-b border-gray-300 pb-0.5 h-3"></div>
              <div className="border-b border-gray-300 pb-0.5 h-3"></div>
            </div>

            {/* Bank Details Box */}
            <div className="space-y-1">
              <div className="inline-block bg-[#001F54] text-white text-[9.5px] font-bold px-3 py-0.5 rounded-full">
                Bank Details :
              </div>
              <div className="space-y-0.5 text-[9.5px] pl-1">
                <div className="flex border-b border-gray-300 pb-0.5">
                  <span className="w-24 font-bold text-[#001F54]">Bank A/c No.</span>
                  <span>: </span>
                  <span className="font-mono font-bold text-black ml-1">
                    {company?.bankDetails?.accountNo || company?.bankDetails?.accountNumber || '50200012345678'}
                  </span>
                </div>
                <div className="flex border-b border-gray-300 pb-0.5">
                  <span className="w-24 font-bold text-[#001F54]">Bank Branch</span>
                  <span>: </span>
                  <span className="text-gray-800 ml-1">
                    {company?.bankDetails?.branch || 'Kalyan / Dombivli'}
                  </span>
                </div>
                <div className="flex border-b border-gray-300 pb-0.5">
                  <span className="w-24 font-bold text-[#001F54]">Bank IFSC</span>
                  <span>: </span>
                  <span className="font-mono text-gray-900 ml-1">
                    {company?.bankDetails?.ifsc || company?.bankDetails?.ifscCode || 'HDFC0001234'}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions Box */}
            <div className="space-y-1">
              <div className="inline-block bg-[#001F54] text-white text-[9.5px] font-bold px-3 py-0.5 rounded-full">
                Terms and Conditions :
              </div>
              <p className="text-[8px] leading-tight text-gray-700 px-1 text-justify">
                {company?.certificationText || 'We hereby certify that my / our registration certificate under the Goods and Service Tax, is in force on the date on which the sale of goods specified in this Tax Invoice is made by me / us and that the transaction of sale covered by this Tax Invoice has been effected by me / us and that the sale has not been effected by any fraud, willful-misstatement or suppression of facts and that all the particulars shown in this Tax Invoice are true and correct. Tax, if any, payable on the said items paid or shall be paid.'}
              </p>
            </div>

            {/* Receiver Stamp area */}
            <div className="pt-4 text-center">
              <span className="text-[9.5px] font-bold text-gray-700">(Receiver's Stamp)</span>
            </div>

          </div>

          {/* Right Footer Column: Totals Table */}
          <div className="col-span-5 flex flex-col justify-between text-[10.5px]">
            <div className="divide-y divide-gray-300">

              {/* Total Amount */}
              <div className="flex items-center justify-between py-1 px-2">
                <span className="font-medium text-gray-900">Total Amount</span>
                <div className="flex items-center gap-1 font-mono w-28 justify-end">
                  <span className="text-gray-700">₹</span>
                  <span className="w-16 text-right font-semibold">{formatRsPs(subtotal).rs}</span>
                  <span>.</span>
                  <span className="w-6 text-left text-gray-600">{formatRsPs(subtotal).ps}</span>
                </div>
              </div>

              {/* Transportation Charges */}
              <div className="flex items-center justify-between py-1 px-2">
                <span className="font-medium text-gray-800">Transportation Charges</span>
                <div className="flex items-center gap-1 font-mono w-28 justify-end">
                  <span className="text-gray-700">₹</span>
                  <span className="w-16 text-right">{transportCharges > 0 ? formatRsPs(transportCharges).rs : '—'}</span>
                  <span>.</span>
                  <span className="w-6 text-left text-gray-600">{transportCharges > 0 ? formatRsPs(transportCharges).ps : '—'}</span>
                </div>
              </div>

              {/* Total Amount Before Tax */}
              <div className="flex items-center justify-between py-1 px-2 font-semibold bg-gray-50">
                <span className="text-gray-900">Total Amount Before Tax</span>
                <div className="flex items-center gap-1 font-mono w-28 justify-end">
                  <span className="text-gray-700">₹</span>
                  <span className="w-16 text-right">{formatRsPs(amountBeforeTax).rs}</span>
                  <span>.</span>
                  <span className="w-6 text-left text-gray-600">{formatRsPs(amountBeforeTax).ps}</span>
                </div>
              </div>

              {/* CGST */}
              <div className="flex items-center justify-between py-1 px-2">
                <span className="text-gray-800">Add: CGST @ <span className="underline px-1">{cgstRatePercent > 0 ? `${cgstRatePercent}` : '____'}</span> %</span>
                <div className="flex items-center gap-1 font-mono w-28 justify-end">
                  <span className="text-gray-700">₹</span>
                  <span className="w-16 text-right">{cgstVal > 0 ? formatRsPs(cgstVal).rs : '—'}</span>
                  <span>.</span>
                  <span className="w-6 text-left text-gray-600">{cgstVal > 0 ? formatRsPs(cgstVal).ps : '—'}</span>
                </div>
              </div>

              {/* SGST */}
              <div className="flex items-center justify-between py-1 px-2">
                <span className="text-gray-800">Add: SGST @ <span className="underline px-1">{sgstRatePercent > 0 ? `${sgstRatePercent}` : '____'}</span> %</span>
                <div className="flex items-center gap-1 font-mono w-28 justify-end">
                  <span className="text-gray-700">₹</span>
                  <span className="w-16 text-right">{sgstVal > 0 ? formatRsPs(sgstVal).rs : '—'}</span>
                  <span>.</span>
                  <span className="w-6 text-left text-gray-600">{sgstVal > 0 ? formatRsPs(sgstVal).ps : '—'}</span>
                </div>
              </div>

              {/* IGST */}
              <div className="flex items-center justify-between py-1 px-2">
                <span className="text-gray-800">Add: IGST @ <span className="underline px-1">{igstRatePercent > 0 ? `${igstRatePercent}` : '____'}</span> %</span>
                <div className="flex items-center gap-1 font-mono w-28 justify-end">
                  <span className="text-gray-700">₹</span>
                  <span className="w-16 text-right">{igstVal > 0 ? formatRsPs(igstVal).rs : '—'}</span>
                  <span>.</span>
                  <span className="w-6 text-left text-gray-600">{igstVal > 0 ? formatRsPs(igstVal).ps : '—'}</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex items-center justify-between py-1 px-2 bg-[#001F54] text-white font-bold text-[12px]">
                <span>Grand Total</span>
                <div className="flex items-center gap-1 font-mono w-28 justify-end text-white">
                  <span>₹</span>
                  <span className="w-16 text-right">{formatRsPs(grandTotal).rs}</span>
                  <span>.</span>
                  <span className="w-6 text-left">{formatRsPs(grandTotal).ps}</span>
                </div>
              </div>
            </div>

            {/* Certification and Signature */}
            <div className="p-3 text-center border-t border-gray-300">
              <div className="text-[9px] text-gray-700 font-medium mb-4">
                Certified that the particulars given above are true and correct.
              </div>
              <div className="font-bold text-[#F26522] text-[11px] uppercase mb-8">
                For CORE PACK INDIA
              </div>
              <div className="w-44 mx-auto border-t border-gray-400"></div>
              <div className="text-[9.5px] font-bold text-gray-900 mt-1">
                Authorised Signatory
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Decorative Bottom Orange Cutout */}
      <div className="absolute bottom-0 right-0 w-8 h-8 overflow-hidden pointer-events-none">
        <div className="w-12 h-12 bg-[#F26522] rotate-45 transform origin-center absolute -bottom-6 -right-6"></div>
      </div>
    </div>
  );
}
