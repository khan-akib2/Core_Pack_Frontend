import React from 'react';
import { formatDate } from '@/lib/utils';

// Helper to convert number to words
function numberToWords(num) {
  if (num === 0) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function iw(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred' + (n % 100 ? ' and ' + iw(n % 100) : '');
    if (n < 100000) return iw(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + iw(n % 1000) : '');
    if (n < 10000000) return iw(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + iw(n % 100000) : '');
    return iw(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + iw(n % 10000000) : '');
  }
  const ip = Math.floor(num);
  const dp = Math.round((num - ip) * 100);
  return iw(ip) + ' Rupees' + (dp > 0 ? ' and ' + iw(dp) + ' Paise' : '') + ' Only';
}

/* ─── Orange-box icons matching template ─────────────────────────── */
const IcPin = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" style={{ flexShrink: 0, display: 'block' }}>
    <rect width="17" height="17" rx="3" fill="#F26522" />
    <path d="M8.5 3C6.57 3 5 4.57 5 6.5C5 9.5 8.5 14 8.5 14C8.5 14 12 9.5 12 6.5C12 4.57 10.43 3 8.5 3ZM8.5 8.25C7.53 8.25 6.75 7.47 6.75 6.5C6.75 5.53 7.53 4.75 8.5 4.75C9.47 4.75 10.25 5.53 10.25 6.5C10.25 7.47 9.47 8.25 8.5 8.25Z" fill="white" />
  </svg>
);
const IcPhone = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" style={{ flexShrink: 0, display: 'block' }}>
    <rect width="17" height="17" rx="3" fill="#F26522" />
    <path d="M4.5 4C4.5 3.72 4.72 3.5 5 3.5H6.6C6.85 3.5 7.08 3.67 7.13 3.92L7.65 6.21C7.7 6.46 7.59 6.71 7.37 6.82L6.35 7.33C7.03 8.87 8.13 9.97 9.67 10.65L10.68 9.63C10.89 9.42 11.14 9.31 11.38 9.36L13.07 9.88C13.32 9.93 13.5 10.16 13.5 10.41V12C13.5 12.28 13.28 12.5 13 12.5C8.31 12.5 4.5 8.69 4.5 4Z" fill="white" />
  </svg>
);
const IcMail = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" style={{ flexShrink: 0, display: 'block' }}>
    <rect width="17" height="17" rx="3" fill="#F26522" />
    <rect x="3" y="4.5" width="11" height="8" rx="1" fill="none" stroke="white" strokeWidth="1.3" />
    <polyline points="3,5.5 8.5,10 14,5.5" fill="none" stroke="white" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);
const IcGlobe = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" style={{ flexShrink: 0, display: 'block' }}>
    <rect width="17" height="17" rx="3" fill="#F26522" />
    <circle cx="8.5" cy="8.5" r="5" fill="none" stroke="white" strokeWidth="1.2" />
    <ellipse cx="8.5" cy="8.5" rx="2.5" ry="5" fill="none" stroke="white" strokeWidth="1.2" />
    <line x1="3.5" y1="7" x2="13.5" y2="7" stroke="white" strokeWidth="1" />
    <line x1="3.5" y1="10" x2="13.5" y2="10" stroke="white" strokeWidth="1" />
  </svg>
);

export function QuotationPrintable({ quotation, company }) {
  if (!quotation) return null;

  const fmtRsPs = (val) => {
    if (val === undefined || val === null || isNaN(val) || val === '') return { rs: '', ps: '' };
    const n = Number(val);
    return { rs: Math.floor(n).toLocaleString('en-IN'), ps: Math.round((n - Math.floor(n)) * 100).toString().padStart(2, '0') };
  };

  const items = quotation.items || [];
  const minRows = 12;
  const dummy = Math.max(0, minRows - items.length);

  const subtotal = Number(quotation.subtotal || 0);
  const gst = Number((quotation.cgstTotal || 0) + (quotation.sgstTotal || 0) + (quotation.igstTotal || 0));
  const grand = Number(quotation.grandTotal || (subtotal + gst));
  const words = quotation.amountInWords || numberToWords(grand);

  const custName = quotation.customerSnapshot?.companyName || quotation.customerSnapshot?.name || '';
  const addr1 = quotation.customerSnapshot?.billingAddress?.street || quotation.customerSnapshot?.address || '';
  const addr2 = [quotation.customerSnapshot?.billingAddress?.city, quotation.customerSnapshot?.billingAddress?.state, quotation.customerSnapshot?.billingAddress?.pincode].filter(Boolean).join(', ');
  const compAddr = company?.address?.street || "B.N. D'souza Compound, Survey No. 21, Sakinaka, Mumbai - 72";

  /* ── tokens ── */
  const N = '#1B2A6B';
  const O = '#F26522';
  const B2 = '2px solid #1B2A6B';
  const B1 = '1px solid #1B2A6B';
  const UL = '1px solid #9CA3AF';

  const fmt2 = (v) => {
    if (typeof v === 'string') return v;
    return typeof v === 'number' ? v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
  };

  /* totals row */
  const TR = ({ label, value, bold, dark }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '4px 10px',
      borderBottom: '1px solid #D0D5E0',
      background: dark ? '#EEF1F8' : 'white',
      minHeight: '22px',
    }}>
      <span style={{ fontWeight: bold ? '700' : '500', color: N, fontSize: '10.5px', letterSpacing: '-0.1px' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
        <span style={{ color: N, fontWeight: '700', fontSize: '11px', fontFamily: 'Arial' }}>&#8377;</span>
        <div style={{ borderBottom: UL, width: '108px', textAlign: 'right', paddingBottom: '1px', fontFamily: 'monospace', fontSize: '10.5px', fontWeight: bold ? '600' : '400', minHeight: '16px' }}>{fmt2(value)}</div>
      </div>
    </div>
  );

  const LBL = ({ w = 60 } = {}) => ({ fontWeight: '700', color: N, width: w + 'px', fontSize: '10.5px', flexShrink: 0 });
  const COL = { fontWeight: '700', color: N, margin: '0 5px 0 0', fontSize: '10.5px', flexShrink: 0 };
  const LINE = { flex: 1, borderBottom: UL, minHeight: '16px', paddingBottom: '2px', fontSize: '10.5px' };

  return (
    <div className="printable-document select-none" style={{
      width: '794px',
      minHeight: '1122px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      fontFamily: "'Inter', sans-serif",
      color: '#000',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* Final outer line of the whole bill */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, border: B2, pointerEvents: 'none', zIndex: 10 }} />
      <style>{`
        @media print {
          @page { margin: 0; size: A4 portrait; }
          body { 
            margin: 0; 
            padding: 0; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          .printable-document {
            margin: 0 auto !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* ════════════════ HEADER ════════════════ */}
      <div style={{ position: 'relative', minHeight: '105px', backgroundColor: 'white', borderBottom: `4px solid ${O}`, overflow: 'hidden' }}>
        {/* Right background SVG */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '440px', zIndex: 1 }}>
          <svg width="100%" height="100%" viewBox="0 0 440 105" preserveAspectRatio="none">
            {/* Orange thick slanted line */}
            <polygon points="60,0 440,0 440,105 10,105" fill={O} />
            {/* Navy main block */}
            <polygon points="66,0 440,0 440,105 16,105" fill={N} />
          </svg>
        </div>

        {/* Content Layer */}
        <div style={{ display: 'flex', position: 'relative', zIndex: 2, minHeight: '105px' }}>
          {/* LEFT: Logo */}
          <div style={{ flex: 1, padding: '5px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img
              src="/branding/logo-trimmed.png"
              alt="Core Pack India"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '190px',
                objectFit: 'contain',
                mixBlendMode: 'multiply'
              }}
            />
          </div>

          {/* RIGHT: Contact */}
          <div style={{
            width: '380px',
            padding: '10px 25px 10px 45px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ marginTop: '2px' }}><IcPin /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: '800', color: O, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</span>
                <span style={{ color: 'white', fontSize: '10.5px', lineHeight: '1.4' }}>{compAddr}</span>
              </div>
            </div>

            {/* Mobile */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ marginTop: '2px' }}><IcPhone /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: '800', color: O, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobile</span>
                <span style={{ color: 'white', fontSize: '10.5px', lineHeight: '1.4' }}>{company?.phone || '8851000041 / 9324540077'}</span>
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ marginTop: '2px' }}><IcMail /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: '800', color: O, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span>
                <span style={{ color: 'white', fontSize: '10.5px', lineHeight: '1.4' }}>{company?.email || 'corepackindia@gmail.com'}</span>
              </div>
            </div>

            {/* GSTIN */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ marginTop: '2px' }}><IcGlobe /></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: '800', color: O, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GSTIN</span>
                <span style={{ color: 'white', fontSize: '11px', lineHeight: '1.4', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '0.5px' }}>{company?.gstin || '27AMSPK9622Q1ZZ'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ MAIN BOX ════════ */}
      <div style={{ flex: 1, border: B2, margin: '12px 8px 8px 8px', background: 'white', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}>

        {/* ── TOP ROW: Title ── */}
        <div style={{ display: 'flex', borderBottom: B2, alignItems: 'stretch' }}>
          <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '6px 0' }}>
            <h2 style={{
              margin: '0 auto',
              fontSize: '18px',
              fontWeight: '900',
              letterSpacing: '8px',
              color: N,
              textTransform: 'uppercase',
              fontFamily: "'Trebuchet MS', 'Segoe UI', Arial, sans-serif"
            }}>
              QUOTATION
            </h2>
          </div>
        </div>

        {/* ── Receiver / Quotation row ── */}
        <div style={{ display: 'flex', borderBottom: B2 }}>

          {/* LEFT: receiver */}
          <div style={{ flex: '1', padding: '6px 12px 6px 10px' }}>
            {/* badge */}
            <div style={{ display: 'inline-block', background: N, color: 'white', fontSize: '9.5px', fontWeight: '700', padding: '3px 10px', borderRadius: '3px', marginBottom: '9px' }}>
              Quotation For
            </div>

            {/* Name */}
            <div style={{ display: 'flex', alignItems: 'center', minHeight: '23px', marginBottom: '5px' }}>
              <span style={LBL({ w: 85 })}>Company Name</span>
              <span style={COL}>:</span>
              <div style={{ ...LINE, fontWeight: '700', textTransform: 'uppercase' }}>{custName}</div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '5px', minHeight: '50px' }}>
              <span style={{ ...LBL({ w: 85 }), paddingTop: '2px' }}>Address</span>
              <span style={{ ...COL, paddingTop: '2px' }}>:</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ borderBottom: UL, minHeight: '16px', paddingBottom: '2px', fontSize: '10.5px' }}>{addr1}</div>
                <div style={{ borderBottom: UL, minHeight: '16px', paddingBottom: '2px', fontSize: '10.5px' }}>{addr2}</div>
              </div>
            </div>

            {/* GSTIN */}
            <div style={{ display: 'flex', alignItems: 'center', minHeight: '23px', marginBottom: '5px' }}>
              <span style={LBL({ w: 85 })}>GSTIN</span>
              <span style={COL}>:</span>
              <div style={{ ...LINE, fontFamily: 'monospace', fontWeight: '700' }}>{quotation.customerSnapshot?.gstin || 'URP'}</div>
            </div>

            {/* Date */}
            <div style={{ display: 'flex', alignItems: 'center', minHeight: '23px' }}>
              <span style={LBL({ w: 85 })}>Date</span>
              <span style={COL}>:</span>
              <div style={{ ...LINE, fontWeight: '600' }}>{formatDate(quotation.quoteDate)}</div>
            </div>
          </div>
        </div>

        {/* ════ PRODUCT TABLE ════ */}
        <table style={{ flex: 1, width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <colgroup>
            <col style={{ width: '40px' }} />
            <col />
            <col style={{ width: '46px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '30px' }} />
          </colgroup>
          <thead>
            <tr style={{ background: N, color: 'white', fontSize: '10px', fontWeight: '700', textAlign: 'center' }}>
              <th style={{ padding: '9px 3px', borderRight: '1px solid rgba(255,255,255,0.25)', verticalAlign: 'middle', lineHeight: '1.35' }}>Sr.<br />No.</th>
              <th style={{ padding: '9px 7px', borderRight: '1px solid rgba(255,255,255,0.25)', textAlign: 'left', verticalAlign: 'middle' }}>Name of Product / Service</th>
              <th style={{ padding: '9px 3px', borderRight: '1px solid rgba(255,255,255,0.25)', verticalAlign: 'middle' }}>Qty</th>
              <th colSpan={2} style={{ padding: '0', verticalAlign: 'top' }}>
                <div style={{ padding: '9px 4px 4px', textAlign: 'center' }}>Rate (&#8377;)</div>
                <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.35)', fontSize: '9px', fontWeight: '600' }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '4px 0', borderRight: '1px solid rgba(255,255,255,0.25)' }}>Rs.</div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '4px 0' }}>Ps.</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const rF = fmtRsPs(item.rate);
              return (
                <tr key={idx} style={{ borderBottom: B1, textAlign: 'center', verticalAlign: 'top', height: '24px' }}>
                  <td style={{ padding: '6px 3px', borderRight: B1, fontSize: '10px' }}>{idx + 1}</td>
                  <td style={{ padding: '6px 7px', borderRight: B1, textAlign: 'left', fontWeight: '600', fontSize: '10.5px' }}>
                    <div>
                      {item.name}
                      {item.boxSize && <span style={{ marginLeft: '6px', fontWeight: '500', color: '#555', fontSize: '9.5px' }}>{item.boxSize}</span>}
                      {item.palletSize && <span style={{ marginLeft: '6px', fontWeight: '500', color: '#555', fontSize: '9.5px' }}>{item.palletSize}</span>}
                    </div>
                    {item.description && <div style={{ fontSize: '9px', color: '#666', fontWeight: '400' }}>{item.description}</div>}
                  </td>
                  <td style={{ padding: '6px 3px', borderRight: B1, fontWeight: '700', fontSize: '10.5px' }}>{item.qty} {item.unit || ''}</td>
                  <td style={{ padding: '6px 3px', borderRight: '1px solid #8896C4', fontFamily: 'monospace', textAlign: 'right', fontSize: '10px' }}>{rF.rs}</td>
                  <td style={{ padding: '6px 3px', fontFamily: 'monospace', textAlign: 'left', color: '#555', fontSize: '10px' }}>{rF.ps}</td>
                </tr>
              );
            })}
            {Array.from({ length: dummy }).map((_, i) => (
              <tr key={'d' + i} style={{ borderBottom: B1, height: '24px' }}>
                <td style={{ borderRight: B1 }}>&nbsp;</td>
                <td style={{ borderRight: B1 }}>&nbsp;</td>
                <td style={{ borderRight: B1 }}>&nbsp;</td>
                <td style={{ borderRight: '1px solid #8896C4' }}>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            ))}
            {/* Filler row to absorb remaining flex height */}
            <tr style={{ height: 'auto' }}>
                <td style={{ borderRight: B1, borderBottom: 'none', backgroundImage: 'linear-gradient(to bottom, transparent 0px, transparent 23px, #8896C4 23px, #8896C4 24px)', backgroundSize: '100% 24px', backgroundPosition: 'top' }}>&nbsp;</td>
                <td style={{ borderRight: B1, borderBottom: 'none', backgroundImage: 'linear-gradient(to bottom, transparent 0px, transparent 23px, #8896C4 23px, #8896C4 24px)', backgroundSize: '100% 24px', backgroundPosition: 'top' }}>&nbsp;</td>
                <td style={{ borderRight: B1, borderBottom: 'none', backgroundImage: 'linear-gradient(to bottom, transparent 0px, transparent 23px, #8896C4 23px, #8896C4 24px)', backgroundSize: '100% 24px', backgroundPosition: 'top' }}>&nbsp;</td>
                <td style={{ borderRight: '1px solid #8896C4', borderBottom: 'none', backgroundImage: 'linear-gradient(to bottom, transparent 0px, transparent 23px, #8896C4 23px, #8896C4 24px)', backgroundSize: '100% 24px', backgroundPosition: 'top' }}>&nbsp;</td>
                <td style={{ borderBottom: 'none', backgroundImage: 'linear-gradient(to bottom, transparent 0px, transparent 23px, #8896C4 23px, #8896C4 24px)', backgroundSize: '100% 24px', backgroundPosition: 'top' }}>&nbsp;</td>
            </tr>
          </tbody>
        </table>

        {/* ════ BOTTOM SECTION: 2 Columns ════ */}
        <div style={{ display: 'flex', borderTop: B2, alignItems: 'stretch' }}>

          {/* LEFT COLUMN */}
          <div style={{ flex: '1', borderRight: B2, padding: '12px 16px' }}>
            <div style={{ display: 'inline-block', background: N, color: 'white', fontSize: '10.5px', fontWeight: '700', padding: '4px 12px', borderRadius: '3px', marginBottom: '8px' }}>Terms & Conditions :</div>
            <div style={{ fontSize: '9.5px', color: '#333', lineHeight: '1.5', textAlign: 'justify', wordBreak: 'break-word', overflowWrap: 'anywhere', fontWeight: '500' }}>
              {company?.certificationText || 'We hereby certify that my / our registration certificate under the Goods and Service Tax, is in force on the date on which the sale of goods specified in this Tax Invoice is made by me / us and that the transaction of sale covered by this Tax Invoice has been effected by me / us and that the sale has not been effected by any fraud, willful-misstatement or suppression of facts and that all the particulars shown in this Tax Invoice are true and correct. Tax, if any, payable on the said items paid or shall be paid.'}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column' }}>

            {/* Signature Section */}
            <div style={{ display: 'flex', flex: 1, minHeight: '130px', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 20px', alignItems: 'flex-end', background: '#fdfdfd' }}>
              <div style={{ fontWeight: '800', color: O, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2px', textAlign: 'right' }}>
                For {company?.companyName || 'CORE PACK INDIA'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '230px' }}>
                <img 
                  src="/branding/signature.png" 
                  alt="Authorized Signature" 
                  style={{ height: '80px', width: 'auto', objectFit: 'contain', marginBottom: '-6px', display: 'block' }} 
                />
                <div style={{ width: '100%', borderTop: '1px solid #111', paddingTop: '4px', textAlign: 'center', fontSize: '10.5px', fontWeight: '700', color: N }}>
                  Authorised Signatory
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
