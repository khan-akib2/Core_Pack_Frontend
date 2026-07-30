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
  
  const custAddressLine1 = invoice.customerSnapshot?.billingAddress?.street || invoice.customerSnapshot?.address || '—';
  const custAddressLine2 = [
    invoice.customerSnapshot?.billingAddress?.city,
    invoice.customerSnapshot?.billingAddress?.state,
    invoice.customerSnapshot?.billingAddress?.pincode
  ].filter(Boolean).join(', ');

  const compAddress = company?.address?.street || "B.N. D'souza Compound, Survey No. 21, Sakinaka, Mumbai - 72";

  return (
    <div className="printable-document bg-white text-black p-4 max-w-[850px] mx-auto text-[11px] font-sans relative print:p-0 print:border-none print:shadow-none select-none border border-gray-300">

      {/* Header Container */}
      {/* Header Container */}
      <div className="relative">
        {/* Top Horizontal Orange Accent Line */}
        <div className="h-[2px] bg-[#F26522] w-full"></div>

        {/* Top Right Corner Dark Navy Accent Polygon */}
        <div className="absolute top-0 right-0 w-36 h-10 overflow-hidden pointer-events-none">
          <div
            className="bg-[#001F54] w-48 h-16"
            style={{ clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 0 100%)' }}
          ></div>
        </div>

        <div className="flex justify-between items-center relative z-10 px-0 py-1 min-h-[105px]">
          {/* Left Section: Crisp PNG Logo (touches borders, no space) */}
          <div className="w-[50%] shrink-0 pl-0 overflow-visible">
            <img 
              src="/logo.png" 
              alt="Core Pack India" 
              className="h-[172px] w-auto object-contain object-left block -my-8 -ml-9 max-w-none" 
            />
          </div>

          {/* Diagonal Orange Divider Line */}
          <div className="relative self-stretch flex items-center h-[105px]">
            <svg className="h-full w-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 30 100">
              <line x1="5" y1="95" x2="25" y2="5" stroke="#F26522" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Right Section: Contact Info (padded right to prevent overlap with top-right navy shape) */}
          <div className="w-[46%] pl-2 pr-12 space-y-1.5 text-[10.5px]">
            {/* Address */}
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#F26522] shrink-0" />
              <span className="font-bold text-[#001F54] shrink-0 w-14">Address</span>
              <span className="text-[#001F54] font-bold">:</span>
              <div className="flex-1 border-b border-gray-400 pb-0.5 text-gray-850 font-bold truncate">
                {compAddress}
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#F26522] shrink-0" />
              <span className="font-bold text-[#001F54] shrink-0 w-14">Mobile</span>
              <span className="text-[#001F54] font-bold">:</span>
              <div className="flex-1 border-b border-gray-400 pb-0.5 text-gray-850 font-bold truncate">
                {company?.phone || '8851000041 / 9324540077'}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#F26522] shrink-0" />
              <span className="font-bold text-[#001F54] shrink-0 w-14">Email</span>
              <span className="text-[#001F54] font-bold">:</span>
              <div className="flex-1 border-b border-gray-400 pb-0.5 text-gray-850 font-bold truncate">
                {company?.email || 'corepackindia@gmail.com'}
              </div>
            </div>

            {/* GSTIN */}
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#F26522] shrink-0" />
              <span className="font-bold text-[#001F54] shrink-0 w-14">GSTIN</span>
              <span className="text-[#001F54] font-bold">:</span>
              <div className="flex-1 border-b border-gray-400 pb-0.5 text-gray-955 font-black font-mono truncate">
                {company?.gstin || '27AMSPK9622Q1ZZ'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Horizontal Orange Accent Line */}
        <div className="h-[2px] bg-[#F26522] w-full"></div>
      </div>

      {/* Centered INVOICE Banner */}
      <div className="relative flex justify-center -my-3.5 z-20">
        <div className="bg-[#001F54] text-white px-14 py-1.5 rounded-md font-bold text-sm tracking-widest uppercase text-center shadow-sm">
          INVOICE
        </div>
      </div>

      {/* Main Outer Boxed Frame */}
      <div className="border-2 border-[#001F54] rounded-sm overflow-hidden bg-white mt-2">

        {/* Receiver Details & Invoice Metadata Container */}
        <div className="grid grid-cols-12 border-b-2 border-[#001F54]">

          {/* Left Column: Receiver / Billed To */}
          <div className="col-span-7 p-2 relative pr-3">
            {/* Dark Navy Pill Badge */}
            <div className="inline-block bg-[#001F54] text-white text-[10px] font-bold px-3 py-0.5 rounded-sm mb-2">
              Details of Receiver / Billed to
            </div>

            <div className="space-y-1.5 text-[10.5px]">
              <div className="flex items-center">
                <span className="w-16 font-bold text-[#001F54] shrink-0">Name</span>
                <span className="font-bold text-[#001F54] mr-2">:</span>
                <div className="flex-1 border-b border-gray-400 pb-0.5 font-bold text-black uppercase min-h-[16px]">
                  {custName}
                </div>
              </div>

              <div className="flex items-start">
                <span className="w-16 font-bold text-[#001F54] shrink-0 pt-0.5">Address</span>
                <span className="font-bold text-[#001F54] mr-2 pt-0.5">:</span>
                <div className="flex-1 flex flex-col min-h-[36px]">
                  <div className="border-b border-gray-400 pb-0.5 text-gray-800 font-medium min-h-[16px]">
                    {custAddressLine1}
                  </div>
                  <div className="border-b border-gray-400 pb-0.5 text-gray-800 font-medium mt-1 min-h-[16px]">
                    {custAddressLine2 || ''}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <span className="w-16 font-bold text-[#001F54] shrink-0">GSTIN</span>
                <span className="font-bold text-[#001F54] mr-2">:</span>
                <div className="flex-1 border-b border-gray-400 pb-0.5 font-mono font-bold text-black min-h-[16px]">
                  {invoice.customerSnapshot?.gstin || 'URP'}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 pr-2">
                  <span className="font-bold text-[#001F54] shrink-0">State</span>
                  <span className="font-bold text-[#001F54] mx-2">:</span>
                  <div className="flex-1 border-b border-gray-400 pb-0.5 text-gray-800 min-h-[16px]">
                    {invoice.customerSnapshot?.billingAddress?.state || 'Maharashtra'}
                  </div>
                </div>
                <div className="flex items-center w-[45%] pl-2">
                  <span className="font-bold text-[#001F54] shrink-0">State Code</span>
                  <span className="font-bold text-[#001F54] mx-2">:</span>
                  <div className="flex-1 border-b border-gray-400 pb-0.5 font-mono text-gray-800 min-h-[16px]">
                    {invoice.customerSnapshot?.billingAddress?.stateCode || '27'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Invoice Metadata */}
          <div className="col-span-5 border-l-2 border-[#001F54] p-2 space-y-1.5 text-[10.5px]">
            <div className="flex items-center">
              <span className="w-24 font-bold text-[#001F54] shrink-0">Invoice No.</span>
              <span className="font-bold text-[#001F54] mr-2">:</span>
              <div className="flex-1 border-b border-gray-400 pb-0.5 font-mono font-bold text-black min-h-[16px]">
                {invoice.invoiceNumber || '—'}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-24 font-bold text-[#001F54] shrink-0">Invoice Date</span>
              <span className="font-bold text-[#001F54] mr-2">:</span>
              <div className="flex-1 border-b border-gray-400 pb-0.5 text-gray-800 font-medium min-h-[16px]">
                {formatDate(invoice.invoiceDate)}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-24 font-bold text-[#001F54] shrink-0">Challan No.</span>
              <span className="font-bold text-[#001F54] mr-2">:</span>
              <div className="flex-1 border-b border-gray-400 pb-0.5 font-mono text-gray-800 min-h-[16px]">
                {invoice.challanNumber || '—'}
              </div>
            </div>

            <div className="flex items-center">
              <span className="w-24 font-bold text-[#001F54] shrink-0">Challan Date</span>
              <span className="font-bold text-[#001F54] mr-2">:</span>
              <div className="flex-1 border-b border-gray-400 pb-0.5 text-gray-800 font-medium min-h-[16px]">
                {invoice.challanDate ? formatDate(invoice.challanDate) : '—'}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center">
                <span className="font-bold text-[#001F54] mr-1">Reverse Charge:</span>
                <div className="flex items-center gap-2 mr-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className={`w-3.5 h-3.5 border border-black flex items-center justify-center text-[9px] font-bold ${invoice.isReverseCharge ? 'bg-[#001F54] text-white' : 'bg-white'}`}>
                      {invoice.isReverseCharge ? '✓' : ''}
                    </span>
                    <span className="font-bold text-gray-800">Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className={`w-3.5 h-3.5 border border-black flex items-center justify-center text-[9px] font-bold ${!invoice.isReverseCharge ? 'bg-[#001F54] text-white' : 'bg-white'}`}>
                      {!invoice.isReverseCharge ? '✓' : ''}
                    </span>
                    <span className="font-bold text-gray-800">No</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center flex-1">
                <span className="font-bold text-[#001F54] shrink-0 mr-1">Vehicle No. :</span>
                <div className="flex-1 border-b border-gray-400 pb-0.5 font-mono uppercase font-bold text-black min-h-[16px]">
                  {invoice.vehicleNo || '—'}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Line Items Table */}
        <table className="w-full border-collapse">
          <thead>
            {/* Top Table Header Row */}
            <tr className="bg-[#001F54] text-white text-[10px] font-bold uppercase text-center divide-x divide-white">
              <th className="py-1.5 px-1 w-10 border-b border-[#001F54]">Sr.<br />No.</th>
              <th className="py-1.5 px-2 text-left border-b border-[#001F54]">Name of Product / Service</th>
              <th className="py-1.5 px-1 w-20 border-b border-[#001F54]">HSN Code</th>
              <th className="py-1.5 px-1 w-12 border-b border-[#001F54]">Qty</th>
              <th className="py-1.5 px-0 w-28 border-b border-[#001F54]">
                <div>Rate (₹)</div>
                <div className="flex justify-around border-t border-white text-[9px] pt-0.5 mt-0.5 font-normal">
                  <span className="w-1/2 text-center border-r border-white">Rs.</span>
                  <span className="w-1/2 text-center">Ps.</span>
                </div>
              </th>
              <th className="py-1.5 px-0 w-32 border-b border-[#001F54]">
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
                <tr key={idx} className="border-b border-[#001F54] divide-x divide-[#001F54] text-center align-top min-h-[32px]">
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
              <tr key={`dummy-${i}`} className="border-b border-[#001F54] divide-x divide-[#001F54] h-8">
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
          <div className="col-span-7 p-2 flex flex-col justify-between space-y-3 border-r-2 border-[#001F54]">

            {/* Amount in Words */}
            <div className="space-y-1">
              <div className="font-bold text-[#001F54] text-[10.5px]">
                Amount in Words :
              </div>
              <div className="relative pt-1">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-gray-400 w-full h-[18px]"></div>
                  <div className="border-b border-gray-400 w-full h-[18px]"></div>
                  <div className="border-b border-gray-400 w-full h-[18px]"></div>
                </div>
                <div className="relative z-10 pl-1 text-[10px] font-bold italic text-gray-900 leading-[18px] min-h-[54px] pr-2">
                  {words}
                </div>
              </div>
            </div>

            {/* Bank Details Box */}
            <div className="space-y-1">
              <div className="inline-block bg-[#001F54] text-white text-[9.5px] font-bold px-3 py-0.5 rounded-sm">
                Bank Details :
              </div>
              <div className="space-y-1 text-[9.5px] pl-1 max-w-[280px]">
                <div className="flex items-center">
                  <span className="w-20 font-bold text-[#001F54]">Bank A/c No.</span>
                  <span className="font-bold text-[#001F54] mr-2">:</span>
                  <div className="flex-1 border-b border-gray-400 pb-0.5 font-mono font-bold text-black min-h-[15px]">
                    {company?.bankDetails?.accountNo || company?.bankDetails?.accountNumber || '50200012345678'}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="w-20 font-bold text-[#001F54]">Bank Branch</span>
                  <span className="font-bold text-[#001F54] mr-2">:</span>
                  <div className="flex-1 border-b border-gray-400 pb-0.5 text-gray-850 min-h-[15px]">
                    {company?.bankDetails?.branch || 'Kalyan / Dombivli'}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="w-20 font-bold text-[#001F54]">Bank IFSC</span>
                  <span className="font-bold text-[#001F54] mr-2">:</span>
                  <div className="flex-1 border-b border-gray-400 pb-0.5 font-mono text-gray-900 min-h-[15px]">
                    {company?.bankDetails?.ifsc || company?.bankDetails?.ifscCode || 'HDFC0001234'}
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions Box */}
            <div className="space-y-1">
              <div className="inline-block bg-[#001F54] text-white text-[9.5px] font-bold px-3 py-0.5 rounded-sm">
                Terms and Conditions :
              </div>
              <p className="text-[8px] leading-tight text-gray-700 px-1 text-justify font-medium">
                {company?.certificationText || 'We hereby certify that my / our registration certificate under the Goods and Service Tax, is in force on the date on which the sale of goods specified in this Tax Invoice is made by me / us and that the transaction of sale covered by this Tax Invoice has been effected by me / us and that the sale has not been effected by any fraud, willful-misstatement or suppression of facts and that all the particulars shown in this Tax Invoice are true and correct. Tax, if any, payable on the said items paid or shall be paid.'}
              </p>
            </div>

            {/* Receiver Stamp area */}
            <div className="pt-2 text-center">
              <span className="text-[9.5px] font-bold text-gray-700">(Receiver's Stamp)</span>
            </div>

          </div>

          {/* Right Footer Column: Totals Table */}
          <div className="col-span-5 flex flex-col justify-between text-[10.5px]">
            <div className="divide-y divide-gray-300">

              {/* Total Amount */}
              <div className="flex items-center justify-between py-1.5 px-2">
                <span className="font-bold text-[#001F54]">Total Amount</span>
                <div className="flex items-center gap-1 font-mono text-right font-bold w-36">
                  <span className="text-[#001F54]">₹</span>
                  <div className="flex-1 border-b border-gray-400 text-right pb-0.5 pr-1 min-h-[16px]">
                    {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Transportation Charges */}
              <div className="flex items-center justify-between py-1.5 px-2">
                <span className="font-bold text-[#001F54]">Transportation Charges</span>
                <div className="flex items-center gap-1 font-mono text-right font-bold w-36">
                  <span className="text-[#001F54]">₹</span>
                  <div className="flex-1 border-b border-gray-400 text-right pb-0.5 pr-1 min-h-[16px]">
                    {transportCharges > 0 
                      ? transportCharges.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : '0.00'}
                  </div>
                </div>
              </div>

              {/* Total Amount Before Tax */}
              <div className="flex items-center justify-between py-1.5 px-2 font-bold bg-gray-50">
                <span className="text-[#001F54]">Total Amount Before Tax</span>
                <div className="flex items-center gap-1 font-mono text-right font-bold w-36">
                  <span className="text-[#001F54]">₹</span>
                  <div className="flex-1 border-b border-gray-400 text-right pb-0.5 pr-1 min-h-[16px]">
                    {amountBeforeTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* CGST */}
              <div className="flex items-center justify-between py-1.5 px-2">
                <span className="text-[#001F54] font-bold">Add: CGST @ <span className="underline px-1">{cgstRatePercent > 0 ? `${cgstRatePercent}%` : '0%'}</span></span>
                <div className="flex items-center gap-1 font-mono text-right font-bold w-36">
                  <span className="text-[#001F54]">₹</span>
                  <div className="flex-1 border-b border-gray-400 text-right pb-0.5 pr-1 min-h-[16px]">
                    {cgstVal > 0 
                      ? cgstVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : '0.00'}
                  </div>
                </div>
              </div>

              {/* SGST */}
              <div className="flex items-center justify-between py-1.5 px-2">
                <span className="text-[#001F54] font-bold">Add: SGST @ <span className="underline px-1">{sgstRatePercent > 0 ? `${sgstRatePercent}%` : '0%'}</span></span>
                <div className="flex items-center gap-1 font-mono text-right font-bold w-36">
                  <span className="text-[#001F54]">₹</span>
                  <div className="flex-1 border-b border-gray-400 text-right pb-0.5 pr-1 min-h-[16px]">
                    {sgstVal > 0 
                      ? sgstVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : '0.00'}
                  </div>
                </div>
              </div>

              {/* IGST */}
              <div className="flex items-center justify-between py-1.5 px-2">
                <span className="text-[#001F54] font-bold">Add: IGST @ <span className="underline px-1">{igstRatePercent > 0 ? `${igstRatePercent}%` : '0%'}</span></span>
                <div className="flex items-center gap-1 font-mono text-right font-bold w-36">
                  <span className="text-[#001F54]">₹</span>
                  <div className="flex-1 border-b border-gray-400 text-right pb-0.5 pr-1 min-h-[16px]">
                    {igstVal > 0 
                      ? igstVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : '0.00'}
                  </div>
                </div>
              </div>

              {/* Total Amount GST */}
              <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50">
                <span className="font-bold text-[#001F54]">Total Amount GST</span>
                <div className="flex items-center gap-1 font-mono text-right font-bold w-36">
                  <span className="text-[#001F54]">₹</span>
                  <div className="flex-1 border-b border-gray-400 text-right pb-0.5 pr-1 min-h-[16px]">
                    {totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex items-center justify-between py-1.5 px-2 bg-[#001F54] text-white font-bold text-[12px]">
                <span>Grand Total</span>
                <div className="flex items-center gap-1 font-mono text-right font-bold w-36">
                  <span>₹</span>
                  <div className="flex-1 border-b border-white text-right pb-0.5 pr-1 min-h-[18px]">
                    {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Certification and Signature */}
            <div className="p-3 text-center border-t border-gray-300">
              <div className="text-[9px] text-gray-700 font-medium mb-3">
                Certified that the particulars given above are true and correct.
              </div>
              <div className="font-bold text-[#F26522] text-[11px] uppercase mb-8">
                For CORE PACK INDIA
              </div>
              <div className="w-44 mx-auto border-t border-gray-400"></div>
              <div className="text-[9.5px] font-bold text-[#001F54] mt-1">
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
