import React from 'react';
import { formatDate } from '@/lib/utils';

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

export function ChallanPrintable({ challan, company }) {
  if (!challan) return null;

  const items = challan.items || [];
  const minRows = 12;
  const dummy = Math.max(0, minRows - items.length);

  const custName = challan.customerSnapshot?.companyName || challan.customerSnapshot?.name || '';
  const addr1 = challan.customerSnapshot?.shippingAddress?.street || challan.customerSnapshot?.billingAddress?.street || challan.customerSnapshot?.address || '';
  const addr2 = [challan.customerSnapshot?.shippingAddress?.city || challan.customerSnapshot?.billingAddress?.city, challan.customerSnapshot?.shippingAddress?.state || challan.customerSnapshot?.billingAddress?.state, challan.customerSnapshot?.shippingAddress?.pincode || challan.customerSnapshot?.billingAddress?.pincode].filter(Boolean).join(', ');
  const compAddr = company?.address?.street || "B.N. D'souza Compound, Survey No. 21, Sakinaka, Mumbai - 72";

  /* ── tokens ── */
  const N = '#1B2A6B';
  const O = '#F26522';
  const B2 = '2px solid #1B2A6B';
  const B1 = '1px solid #1B2A6B';
  const UL = '1px dotted #9CA3AF';

  /* field row */
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
              src="/logo.png"
              alt="Core Pack India"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '190px',
                objectFit: 'contain',
                objectPosition: '23px',
                transform: 'scale(1.4)',
                transformOrigin: 'center center',
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
        <div style={{ display: 'flex', borderBottom: B2, alignItems: 'center', justifyContent: 'center', minHeight: '32px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', letterSpacing: '3px', color: N, textTransform: 'uppercase' }}>
            DELIVERY CHALLAN
          </h2>
        </div>

        {/* ── Receiver / Challan row ── */}
        <div style={{ display: 'flex', borderBottom: B2 }}>
          {/* LEFT: receiver */}
          <div style={{ flex: '1', padding: '12px 16px', borderRight: B2 }}>
            {/* Name */}
            <div style={{ display: 'flex', alignItems: 'flex-end', minHeight: '26px', marginBottom: '8px' }}>
              <span style={{ ...LBL({w: 30}), color: O, fontSize: '12px' }}>M/s.</span>
              <div style={{ ...LINE, borderBottom: '1px solid #111', fontWeight: '800', textTransform: 'uppercase', fontSize: '13px', paddingLeft: '8px', color: '#111' }}>{custName}</div>
            </div>
            {/* Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ borderBottom: '1px solid #111', minHeight: '22px', fontSize: '12px', paddingLeft: '8px', color: '#333' }}>{addr1}</div>
              <div style={{ borderBottom: '1px solid #111', minHeight: '22px', fontSize: '12px', paddingLeft: '8px', color: '#333' }}>{addr2}</div>
            </div>
          </div>

          {/* RIGHT: metadata */}
          <div style={{ flex: '0 0 240px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
            {/* Challan No */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ fontWeight: '800', color: O, fontSize: '12px', width: '80px', flexShrink: 0 }}>Challan No.</span>
              <div style={{ flex: 1, borderBottom: '1px dotted #111', fontFamily: 'monospace', fontWeight: '800', fontSize: '13px', textAlign: 'center' }}>{challan.challanNumber || ''}</div>
            </div>
            {/* Date */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ fontWeight: '800', color: O, fontSize: '12px', width: '80px', flexShrink: 0 }}>Challan Date</span>
              <div style={{ flex: 1, borderBottom: '1px dotted #111', fontSize: '13px', textAlign: 'center', fontWeight: '600' }}>{formatDate(challan.challanDate)}</div>
            </div>
            {/* Vehicle No */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ fontWeight: '800', color: O, fontSize: '12px', width: '80px', flexShrink: 0 }}>Vehicle No.</span>
              <div style={{ flex: 1, borderBottom: '1px dotted #111', fontSize: '12px', textAlign: 'center', fontFamily: 'monospace', fontWeight: '600' }}>{challan.vehicleNo || ''}</div>
            </div>
          </div>
        </div>

        {/* Sub-banner */}
        <div style={{ textAlign: 'center', padding: '6px 0', borderBottom: B2, color: O, fontSize: '11px', fontWeight: '600' }}>
          {company?.challanBannerText || 'Please receive the following goods in good order & condition.'}
        </div>

        {/* ════ PRODUCT TABLE ════ */}
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto', flex: 1 }}>
          <colgroup>
            <col style={{ width: '50px' }} />
            <col />
            <col style={{ width: '120px' }} />
          </colgroup>
          <thead>
            <tr style={{ color: N, fontSize: '11px', fontWeight: '800', textAlign: 'center', borderBottom: B2 }}>
              <th style={{ padding: '8px', borderRight: B2 }}>S.No.</th>
              <th style={{ padding: '8px', borderRight: B2 }}>PARTICULARS</th>
              <th style={{ padding: '8px' }}>QUANTITY</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ textAlign: 'center', verticalAlign: 'top', height: '26px' }}>
                <td style={{ padding: '8px', borderRight: B2, borderBottom: B1, fontSize: '11px', fontWeight: '600' }}>{idx + 1}</td>
                <td style={{ padding: '8px 12px', borderRight: B2, borderBottom: B1, textAlign: 'left' }}>
                  <div style={{ fontWeight: '700', fontSize: '13px', color: '#111' }}>
                    {item.name}
                    {item.boxSize && <span style={{ marginLeft: '8px', fontWeight: '500', color: '#666', fontSize: '11px' }}>{item.boxSize}</span>}
                    {item.palletSize && <span style={{ marginLeft: '8px', fontWeight: '500', color: '#666', fontSize: '11px' }}>{item.palletSize}</span>}
                  </div>
                  {item.description && <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{item.description}</div>}
                </td>
                <td style={{ padding: '8px', borderBottom: B1, fontWeight: '800', fontSize: '14px', color: '#111' }}>{item.qty}</td>
              </tr>
            ))}
            {Array.from({ length: dummy }).map((_, i) => (
              <tr key={'d' + i} style={{ height: '26px' }}>
                <td style={{ borderRight: B2, borderBottom: B1 }}>&nbsp;</td>
                <td style={{ borderRight: B2, borderBottom: B1 }}>&nbsp;</td>
                <td style={{ borderBottom: B1 }}>&nbsp;</td>
              </tr>
            ))}
            {/* Filler row to absorb remaining flex height */}
            <tr style={{ height: 'auto' }}>
                <td style={{ borderRight: B2, borderBottom: 'none', backgroundImage: 'linear-gradient(to bottom, transparent 0px, transparent 25px, #1B2A6B 25px, #1B2A6B 26px)', backgroundSize: '100% 26px', backgroundPosition: 'top' }}>&nbsp;</td>
                <td style={{ borderRight: B2, borderBottom: 'none', backgroundImage: 'linear-gradient(to bottom, transparent 0px, transparent 25px, #1B2A6B 25px, #1B2A6B 26px)', backgroundSize: '100% 26px', backgroundPosition: 'top' }}>&nbsp;</td>
                <td style={{ borderBottom: 'none', backgroundImage: 'linear-gradient(to bottom, transparent 0px, transparent 25px, #1B2A6B 25px, #1B2A6B 26px)', backgroundSize: '100% 26px', backgroundPosition: 'top' }}>&nbsp;</td>
            </tr>
          </tbody>
        </table>

        {/* ════ BOTTOM SECTION ════ */}
        <div style={{ display: 'flex', borderTop: B2, minHeight: '150px' }}>
          {/* Left: Receiver Signature */}
          <div style={{ flex: 1, borderRight: B2, position: 'relative', display: 'flex', flexDirection: 'column', padding: '12px 16px', justifyContent: 'flex-end' }}>
            <div style={{ borderTop: '1px solid #111', width: '200px', fontSize: '11px', fontWeight: '700', color: O, textAlign: 'center', paddingTop: '4px' }}>
              Receiver&apos;s Signature
            </div>
          </div>
          
          {/* Right: Proprietor Signature */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', padding: '16px 24px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: '800', color: O }}>
              For {company?.companyName || 'CORE PACK INDIA'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '240px' }}>
              <img 
                src="/signature.png" 
                alt="Authorized Signature" 
                style={{ height: '80px', width: 'auto', objectFit: 'contain', marginBottom: '-6px', display: 'block' }} 
              />
              <div style={{ width: '100%', borderTop: '1px solid #111', paddingTop: '4px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: N }}>
                Proprietor / Authorised Signatory
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
