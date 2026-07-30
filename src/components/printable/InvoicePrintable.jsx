import React from 'react';
import { formatDate } from '@/lib/utils';

/* ─── number → words ─────────────────────────────────────────────── */
function numberToWords(num) {
  if (!num || isNaN(num) || num === 0) return 'Zero Rupees Only';
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
    'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function iw(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n/10)] + (n%10 ? ' '+a[n%10] : '');
    if (n < 1000) return a[Math.floor(n/100)]+' Hundred'+(n%100 ? ' '+iw(n%100) : '');
    if (n < 100000) return iw(Math.floor(n/1000))+' Thousand'+(n%1000 ? ' '+iw(n%1000) : '');
    if (n < 10000000) return iw(Math.floor(n/100000))+' Lakh'+(n%100000 ? ' '+iw(n%100000) : '');
    return iw(Math.floor(n/10000000))+' Crore'+(n%10000000 ? ' '+iw(n%10000000) : '');
  }
  const ip = Math.floor(num);
  const dp = Math.round((num-ip)*100);
  return iw(ip)+' Rupees'+(dp > 0 ? ' and '+iw(dp)+' Paise' : '')+' Only';
}

/* ─── Orange-box icons matching template ─────────────────────────── */
const IcPin = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" style={{flexShrink:0,display:'block'}}>
    <rect width="17" height="17" rx="3" fill="#F26522"/>
    <path d="M8.5 3C6.57 3 5 4.57 5 6.5C5 9.5 8.5 14 8.5 14C8.5 14 12 9.5 12 6.5C12 4.57 10.43 3 8.5 3ZM8.5 8.25C7.53 8.25 6.75 7.47 6.75 6.5C6.75 5.53 7.53 4.75 8.5 4.75C9.47 4.75 10.25 5.53 10.25 6.5C10.25 7.47 9.47 8.25 8.5 8.25Z" fill="white"/>
  </svg>
);
const IcPhone = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" style={{flexShrink:0,display:'block'}}>
    <rect width="17" height="17" rx="3" fill="#F26522"/>
    <path d="M4.5 4C4.5 3.72 4.72 3.5 5 3.5H6.6C6.85 3.5 7.08 3.67 7.13 3.92L7.65 6.21C7.7 6.46 7.59 6.71 7.37 6.82L6.35 7.33C7.03 8.87 8.13 9.97 9.67 10.65L10.68 9.63C10.89 9.42 11.14 9.31 11.38 9.36L13.07 9.88C13.32 9.93 13.5 10.16 13.5 10.41V12C13.5 12.28 13.28 12.5 13 12.5C8.31 12.5 4.5 8.69 4.5 4Z" fill="white"/>
  </svg>
);
const IcMail = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" style={{flexShrink:0,display:'block'}}>
    <rect width="17" height="17" rx="3" fill="#F26522"/>
    <rect x="3" y="4.5" width="11" height="8" rx="1" fill="none" stroke="white" strokeWidth="1.3"/>
    <polyline points="3,5.5 8.5,10 14,5.5" fill="none" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
);
const IcGlobe = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" style={{flexShrink:0,display:'block'}}>
    <rect width="17" height="17" rx="3" fill="#F26522"/>
    <circle cx="8.5" cy="8.5" r="5" fill="none" stroke="white" strokeWidth="1.2"/>
    <ellipse cx="8.5" cy="8.5" rx="2.5" ry="5" fill="none" stroke="white" strokeWidth="1.2"/>
    <line x1="3.5" y1="7" x2="13.5" y2="7" stroke="white" strokeWidth="1"/>
    <line x1="3.5" y1="10" x2="13.5" y2="10" stroke="white" strokeWidth="1"/>
  </svg>
);

/* ─── Main Component ─────────────────────────────────────────────── */
export function InvoicePrintable({ invoice, company }) {
  if (!invoice) return null;

  const fmtRsPs = (val) => {
    if (val === undefined || val === null || isNaN(val) || val === '') return { rs:'', ps:'' };
    const n = Number(val);
    return { rs: Math.floor(n).toLocaleString('en-IN'), ps: Math.round((n-Math.floor(n))*100).toString().padStart(2,'0') };
  };

  const items = invoice.items || [];
  const minRows = 8;
  const dummy = Math.max(0, minRows - items.length);

  const subtotal = Number(invoice.subtotal || 0);
  const transport = Number(invoice.transportationCharges || 0);
  const beforeTax = subtotal + transport;
  const tax0 = items[0]?.taxRate || 5;
  const cgstR = invoice.isInterstate ? 0 : tax0/2;
  const sgstR = invoice.isInterstate ? 0 : tax0/2;
  const igstR = invoice.isInterstate ? tax0 : 0;
  const cgstV = invoice.cgstTotal !== undefined ? Number(invoice.cgstTotal) : (invoice.isInterstate ? 0 : subtotal*(cgstR/100));
  const sgstV = invoice.sgstTotal !== undefined ? Number(invoice.sgstTotal) : (invoice.isInterstate ? 0 : subtotal*(sgstR/100));
  const igstV = invoice.igstTotal !== undefined ? Number(invoice.igstTotal) : (invoice.isInterstate ? subtotal*(igstR/100) : 0);
  const gst = cgstV + sgstV + igstV;
  const grand = Number(invoice.grandTotal || (beforeTax + gst));
  const words = invoice.amountInWords || numberToWords(grand);

  const custName = invoice.customerSnapshot?.companyName || invoice.customerSnapshot?.name || '';
  const addr1 = invoice.customerSnapshot?.billingAddress?.street || invoice.customerSnapshot?.address || '';
  const addr2 = [invoice.customerSnapshot?.billingAddress?.city, invoice.customerSnapshot?.billingAddress?.state, invoice.customerSnapshot?.billingAddress?.pincode].filter(Boolean).join(', ');
  const compAddr = company?.address?.street || "B.N. D'souza Compound, Survey No. 21, Sakinaka, Mumbai - 72";

  /* ── tokens ── */
  const N = '#1B2A6B';
  const O = '#F26522';
  const B2 = '2px solid #1B2A6B';   /* outer/section borders */
  const B1 = '1px solid #1B2A6B';   /* table inner borders */
  const UL = '1px solid #9CA3AF';   /* writing underlines */

  const fmt2 = (v) => typeof v === 'number' ? v.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}) : '';

  /* totals row */
  const TR = ({label, value, bold, dark}) => (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'5.5px 10px',
      borderBottom:'1px solid #D0D5E0',
      background: dark ? '#EEF1F8' : 'white',
      minHeight:'28px',
    }}>
      <span style={{fontWeight: bold?'700':'500', color: N, fontSize:'10.5px', letterSpacing:'-0.1px'}}>{label}</span>
      <div style={{display:'flex', alignItems:'center', gap:'5px', flexShrink:0}}>
        <span style={{color:N, fontWeight:'700', fontSize:'11px', fontFamily:'Arial'}}>&#8377;</span>
        <div style={{borderBottom:UL, width:'108px', textAlign:'right', paddingBottom:'1px', fontFamily:'monospace', fontSize:'10.5px', fontWeight: bold?'600':'400', minHeight:'16px'}}>{fmt2(value)}</div>
      </div>
    </div>
  );

  /* field row */
  const LBL = ({w=60} = {}) => ({fontWeight:'700', color:N, width:w+'px', fontSize:'10.5px', flexShrink:0});
  const COL = {fontWeight:'700', color:N, margin:'0 5px 0 0', fontSize:'10.5px', flexShrink:0};
  const LINE = {flex:1, borderBottom:UL, minHeight:'16px', paddingBottom:'2px', fontSize:'10.5px'};

  return (
    <div className="printable-document select-none" style={{
      background:'white', color:'#111', width:'794px', margin:'0 auto',
      fontSize:'10.5px', fontFamily:"Arial,'Helvetica Neue',Helvetica,sans-serif",
      position:'relative', border:'1px solid #CCC', boxSizing:'border-box',
    }}>

      {/* ════════════════ HEADER ════════════════ */}
      <div style={{position:'relative', overflow:'visible'}}>

        {/* top orange bar */}
        <div style={{height:'4px', background:O}}/>

        {/* top-right navy polygon */}
        <div style={{position:'absolute', top:0, right:0, width:'185px', height:'65px', overflow:'hidden', zIndex:3, pointerEvents:'none'}}>
          <div style={{background:N, width:'240px', height:'90px', clipPath:'polygon(44% 0, 100% 0, 100% 100%, 0 100%)'}}/>
        </div>

        {/* header body */}
        <div style={{display:'flex', alignItems:'stretch', minHeight:'168px', position:'relative', zIndex:2, background:'white'}}>

          {/* LEFT: logo */}
          <div style={{width:'50%', display:'flex', alignItems:'center', justifyContent:'flex-start', padding:'8px 0 8px 8px'}}>
            <img src="/logo.png" alt="Core Pack India" style={{
              height:'152px', width:'auto', objectFit:'contain',
              objectPosition:'left center', display:'block', maxWidth:'none',
            }}/>
          </div>

          {/* diagonal divider */}
          <div style={{width:'38px', flexShrink:0, position:'relative'}}>
            <svg width="38" height="168" viewBox="0 0 38 168" preserveAspectRatio="none"
              style={{position:'absolute', top:0, left:0, display:'block'}}>
              <line x1="9" y1="163" x2="29" y2="5" stroke={O} strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>

          {/* RIGHT: contact info */}
          <div style={{
            flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
            gap:'11px', paddingLeft:'2px', paddingRight:'58px',
            paddingTop:'12px', paddingBottom:'12px',
          }}>
            {/* Address */}
            <div style={{display:'flex', alignItems:'center', gap:'9px'}}>
              <IcPin/>
              <span style={LBL({w:52})}>Address</span>
              <span style={COL}>:</span>
              <div style={{...LINE}}>{compAddr}</div>
            </div>
            {/* Mobile */}
            <div style={{display:'flex', alignItems:'center', gap:'9px'}}>
              <IcPhone/>
              <span style={LBL({w:52})}>Mobile</span>
              <span style={COL}>:</span>
              <div style={{...LINE}}>{company?.phone || '8851000041 / 9324540077'}</div>
            </div>
            {/* Email */}
            <div style={{display:'flex', alignItems:'center', gap:'9px'}}>
              <IcMail/>
              <span style={LBL({w:52})}>Email</span>
              <span style={COL}>:</span>
              <div style={{...LINE}}>{company?.email || 'corepackindia@gmail.com'}</div>
            </div>
            {/* GSTIN */}
            <div style={{display:'flex', alignItems:'center', gap:'9px'}}>
              <IcGlobe/>
              <span style={LBL({w:52})}>GSTIN</span>
              <span style={COL}>:</span>
              <div style={{...LINE, fontFamily:'monospace', fontWeight:'700'}}>{company?.gstin || '27AMSPK9622Q1ZZ'}</div>
            </div>
          </div>
        </div>

        {/* bottom orange bar */}
        <div style={{height:'4px', background:O}}/>
      </div>

      {/* ════════ INVOICE BADGE ════════ */}
      <div style={{display:'flex', justifyContent:'center', position:'relative', zIndex:20, marginTop:'-16px'}}>
        <div style={{
          background:N, color:'white', padding:'8px 74px',
          borderRadius:'5px', fontWeight:'800', fontSize:'15px',
          letterSpacing:'5px', textTransform:'uppercase', textAlign:'center',
          fontFamily:"Arial,sans-serif",
        }}>
          INVOICE
        </div>
      </div>

      {/* ════════ MAIN BOX ════════ */}
      <div style={{border:B2, margin:'12px 8px 8px 8px', background:'white', position:'relative'}}>

        {/* ── Receiver / Invoice row ── */}
        <div style={{display:'flex', borderBottom:B2}}>

          {/* LEFT: receiver */}
          <div style={{flex:'0 0 58%', padding:'9px 12px 11px 10px'}}>
            {/* badge */}
            <div style={{display:'inline-block', background:N, color:'white', fontSize:'9.5px', fontWeight:'700', padding:'3px 10px', borderRadius:'3px', marginBottom:'9px'}}>
              Details of Receiver / Billed to
            </div>

            {/* Name */}
            <div style={{display:'flex', alignItems:'center', minHeight:'23px', marginBottom:'5px'}}>
              <span style={LBL()}>Name</span>
              <span style={COL}>:</span>
              <div style={{...LINE, fontWeight:'700', textTransform:'uppercase'}}>{custName}</div>
            </div>

            {/* Address – 2 underline lines */}
            <div style={{display:'flex', alignItems:'flex-start', marginBottom:'5px', minHeight:'50px'}}>
              <span style={{...LBL(), paddingTop:'2px'}}>Address</span>
              <span style={{...COL, paddingTop:'2px'}}>:</span>
              <div style={{flex:1, display:'flex', flexDirection:'column', gap:'5px'}}>
                <div style={{borderBottom:UL, minHeight:'16px', paddingBottom:'2px', fontSize:'10.5px'}}>{addr1}</div>
                <div style={{borderBottom:UL, minHeight:'16px', paddingBottom:'2px', fontSize:'10.5px'}}>{addr2}</div>
              </div>
            </div>

            {/* GSTIN */}
            <div style={{display:'flex', alignItems:'center', minHeight:'23px', marginBottom:'5px'}}>
              <span style={LBL()}>GSTIN</span>
              <span style={COL}>:</span>
              <div style={{...LINE, fontFamily:'monospace', fontWeight:'700'}}>{invoice.customerSnapshot?.gstin || 'URP'}</div>
            </div>

            {/* State / State Code */}
            <div style={{display:'flex', alignItems:'center', minHeight:'23px'}}>
              <span style={LBL()}>State</span>
              <span style={COL}>:</span>
              <div style={{flex:1, borderBottom:UL, minHeight:'16px', paddingBottom:'2px', fontSize:'10.5px'}}>{invoice.customerSnapshot?.billingAddress?.state || 'Maharashtra'}</div>
              <span style={{fontWeight:'700', color:N, fontSize:'10.5px', whiteSpace:'nowrap', marginLeft:'14px', flexShrink:0}}>State Code</span>
              <span style={{...COL, marginLeft:'4px'}}>:</span>
              <div style={{borderBottom:UL, width:'62px', minHeight:'16px', paddingBottom:'2px', fontSize:'10.5px', fontFamily:'monospace'}}>{invoice.customerSnapshot?.billingAddress?.stateCode || '27'}</div>
            </div>
          </div>

          {/* RIGHT: invoice metadata */}
          <div style={{flex:'0 0 42%', borderLeft:B2, padding:'10px 10px 10px 12px'}}>
            {/* Invoice No */}
            <div style={{display:'flex', alignItems:'center', minHeight:'23px', marginBottom:'6px', marginTop:'2px'}}>
              <span style={LBL({w:92})}>Invoice No.</span>
              <span style={COL}>:</span>
              <div style={{...LINE, fontFamily:'monospace', fontWeight:'700'}}>{invoice.invoiceNumber || ''}</div>
            </div>
            {/* Invoice Date */}
            <div style={{display:'flex', alignItems:'center', minHeight:'23px', marginBottom:'6px'}}>
              <span style={LBL({w:92})}>Invoice Date</span>
              <span style={COL}>:</span>
              <div style={{...LINE}}>{formatDate(invoice.invoiceDate)}</div>
            </div>
            {/* Challan No */}
            <div style={{display:'flex', alignItems:'center', minHeight:'23px', marginBottom:'6px'}}>
              <span style={LBL({w:92})}>Challan No.</span>
              <span style={COL}>:</span>
              <div style={{...LINE, fontFamily:'monospace'}}>{invoice.challanNumber || ''}</div>
            </div>
            {/* Challan Date */}
            <div style={{display:'flex', alignItems:'center', minHeight:'23px', marginBottom:'6px'}}>
              <span style={LBL({w:92})}>Challan Date</span>
              <span style={COL}>:</span>
              <div style={{...LINE}}>{invoice.challanDate ? formatDate(invoice.challanDate) : ''}</div>
            </div>
            {/* Reverse Charge + Vehicle No */}
            <div style={{display:'flex', alignItems:'center', minHeight:'23px', gap:'5px', flexWrap:'nowrap'}}>
              <span style={{fontWeight:'700', color:N, fontSize:'9.5px', whiteSpace:'nowrap'}}>Reverse Charge:</span>
              {[{lbl:'Yes', chk:!!invoice.isReverseCharge},{lbl:'No', chk:!invoice.isReverseCharge}].map(({lbl,chk})=>(
                <label key={lbl} style={{display:'flex', alignItems:'center', gap:'3px', cursor:'pointer', flexShrink:0}}>
                  <span style={{width:'12px', height:'12px', border:'1px solid #555', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'8px', fontWeight:'900', background:chk?N:'white', color:chk?'white':'transparent', flexShrink:0}}>&#10003;</span>
                  <span style={{fontSize:'9.5px', fontWeight:'600'}}>{lbl}</span>
                </label>
              ))}
              <span style={{fontWeight:'700', color:N, fontSize:'9.5px', whiteSpace:'nowrap', marginLeft:'6px', flexShrink:0}}>Vehicle No. :</span>
              <div style={{flex:1, borderBottom:UL, minHeight:'16px', paddingBottom:'1px', fontSize:'9.5px', fontFamily:'monospace', fontWeight:'700', minWidth:'52px'}}>{invoice.vehicleNo || ''}</div>
            </div>
          </div>
        </div>

        {/* ════ PRODUCT TABLE ════ */}
        <table style={{width:'100%', borderCollapse:'collapse', tableLayout:'fixed'}}>
          <colgroup>
            <col style={{width:'40px'}}/>
            <col/>
            <col style={{width:'78px'}}/>
            <col style={{width:'46px'}}/>
            <col style={{width:'57px'}}/>
            <col style={{width:'37px'}}/>
            <col style={{width:'63px'}}/>
            <col style={{width:'40px'}}/>
          </colgroup>
          <thead>
            <tr style={{background:N, color:'white', fontSize:'10px', fontWeight:'700', textAlign:'center'}}>
              <th style={{padding:'9px 3px', borderRight:'1px solid rgba(255,255,255,0.25)', verticalAlign:'bottom', lineHeight:'1.35'}}>Sr.<br/>No.</th>
              <th style={{padding:'9px 7px', borderRight:'1px solid rgba(255,255,255,0.25)', textAlign:'left', verticalAlign:'bottom'}}>Name of Product / Service</th>
              <th style={{padding:'9px 3px', borderRight:'1px solid rgba(255,255,255,0.25)', verticalAlign:'bottom'}}>HSN Code</th>
              <th style={{padding:'9px 3px', borderRight:'1px solid rgba(255,255,255,0.25)', verticalAlign:'bottom'}}>Qty</th>
              <th colSpan={2} style={{padding:'0', borderRight:'1px solid rgba(255,255,255,0.25)', verticalAlign:'top'}}>
                <div style={{padding:'9px 4px 4px', textAlign:'center'}}>Rate (&#8377;)</div>
                <div style={{display:'flex', borderTop:'1px solid rgba(255,255,255,0.35)', fontSize:'9px', fontWeight:'600'}}>
                  <div style={{flex:1, textAlign:'center', padding:'4px 0', borderRight:'1px solid rgba(255,255,255,0.25)'}}>Rs.</div>
                  <div style={{flex:1, textAlign:'center', padding:'4px 0'}}>Ps.</div>
                </div>
              </th>
              <th colSpan={2} style={{padding:'0', verticalAlign:'top'}}>
                <div style={{padding:'9px 4px 4px', textAlign:'center'}}>Amount (&#8377;)</div>
                <div style={{display:'flex', borderTop:'1px solid rgba(255,255,255,0.35)', fontSize:'9px', fontWeight:'600'}}>
                  <div style={{flex:1, textAlign:'center', padding:'4px 0', borderRight:'1px solid rgba(255,255,255,0.25)'}}>Rs.</div>
                  <div style={{flex:1, textAlign:'center', padding:'4px 0'}}>Ps.</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const rF = fmtRsPs(item.rate);
              const aF = fmtRsPs(item.taxableAmount || (item.qty * item.rate));
              return (
                <tr key={idx} style={{borderBottom:B1, textAlign:'center', verticalAlign:'top', height:'34px'}}>
                  <td style={{padding:'8px 3px', borderRight:B1, fontSize:'10px'}}>{idx+1}</td>
                  <td style={{padding:'8px 7px', borderRight:B1, textAlign:'left', fontWeight:'600', fontSize:'10.5px'}}>
                    <div>{item.name}</div>
                    {item.description && <div style={{fontSize:'9px', color:'#666', fontWeight:'400'}}>{item.description}</div>}
                    {(item.boxSize||item.palletSize) && <div style={{fontSize:'9px', color:'#666', fontWeight:'500', marginTop:'1px'}}>{item.boxSize&&<span style={{marginRight:'8px'}}>Box: {item.boxSize}</span>}{item.palletSize&&<span>Pallet: {item.palletSize}</span>}</div>}
                  </td>
                  <td style={{padding:'8px 3px', borderRight:B1, fontFamily:'monospace', fontSize:'10px'}}>{item.hsnCode||'44151000'}</td>
                  <td style={{padding:'8px 3px', borderRight:B1, fontWeight:'700', fontSize:'10.5px'}}>{item.qty}</td>
                  <td style={{padding:'8px 3px', borderRight:'1px solid #8896C4', fontFamily:'monospace', textAlign:'right', fontSize:'10px'}}>{rF.rs}</td>
                  <td style={{padding:'8px 3px', borderRight:B1, fontFamily:'monospace', textAlign:'left', color:'#555', fontSize:'10px'}}>{rF.ps}</td>
                  <td style={{padding:'8px 3px', borderRight:'1px solid #8896C4', fontFamily:'monospace', fontWeight:'600', textAlign:'right', fontSize:'10px'}}>{aF.rs}</td>
                  <td style={{padding:'8px 3px', fontFamily:'monospace', textAlign:'left', color:'#555', fontSize:'10px'}}>{aF.ps}</td>
                </tr>
              );
            })}
            {Array.from({length:dummy}).map((_,i)=>(
              <tr key={'d'+i} style={{borderBottom:B1, height:'34px'}}>
                <td style={{borderRight:B1}}>&nbsp;</td>
                <td style={{borderRight:B1}}>&nbsp;</td>
                <td style={{borderRight:B1}}>&nbsp;</td>
                <td style={{borderRight:B1}}>&nbsp;</td>
                <td style={{borderRight:'1px solid #8896C4'}}>&nbsp;</td>
                <td style={{borderRight:B1}}>&nbsp;</td>
                <td style={{borderRight:'1px solid #8896C4'}}>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ════ AMOUNT IN WORDS + TOTALS ROW ════ */}
        <div style={{display:'flex', borderTop:B2, alignItems:'stretch'}}>

          {/* Amount in Words — LEFT 58% */}
          <div style={{flex:'0 0 58%', borderRight:B2, padding:'9px 12px 9px 10px'}}>
            <div style={{fontWeight:'700', color:N, fontSize:'10.5px', marginBottom:'7px'}}>Amount in Words :</div>
            <div style={{position:'relative', height:'69px'}}>
              <div style={{position:'absolute', left:0, right:0, top:'23px', borderBottom:'1px solid #9CA3AF'}}/>
              <div style={{position:'absolute', left:0, right:0, top:'46px', borderBottom:'1px solid #9CA3AF'}}/>
              <div style={{position:'absolute', left:0, right:0, top:'69px', borderBottom:'1px solid #9CA3AF'}}/>
              <div style={{position:'absolute', top:0, left:'2px', right:'2px', fontSize:'9.5px', fontWeight:'700', fontStyle:'italic', color:'#111', lineHeight:'23px', height:'69px', overflow:'hidden'}}>{words}</div>
            </div>
          </div>

          {/* Totals — RIGHT 42% */}
          <div style={{flex:'0 0 42%', display:'flex', flexDirection:'column'}}>
            <TR label="Total Amount"            value={subtotal}/>
            <TR label="Transportation Charges"  value={transport}/>
            <TR label="Total Amount Before Tax"  value={beforeTax} bold dark/>
            <TR label={<>Add: CGST @ <span style={{display:'inline-block',borderBottom:'1px solid #666',minWidth:'32px',textAlign:'center',fontSize:'10px'}}>{cgstR>0?cgstR:''}</span> %</>} value={cgstV}/>
            <TR label={<>Add: SGST @ <span style={{display:'inline-block',borderBottom:'1px solid #666',minWidth:'32px',textAlign:'center',fontSize:'10px'}}>{sgstR>0?sgstR:''}</span> %</>} value={sgstV}/>
            <TR label={<>Add: IGST @ <span style={{display:'inline-block',borderBottom:'1px solid #666',minWidth:'32px',textAlign:'center',fontSize:'10px'}}>{igstR>0?igstR:''}</span> %</>} value={igstV}/>
            <TR label="Total Amount GST"         value={gst} bold dark/>
            {/* Grand Total */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 10px', background:N, color:'white', minHeight:'38px'}}>
              <span style={{fontWeight:'800', fontSize:'13.5px', letterSpacing:'0.3px'}}>Grand Total</span>
              <div style={{display:'flex', alignItems:'center', gap:'5px', flexShrink:0}}>
                <span style={{fontWeight:'800', fontSize:'13.5px'}}>&#8377;</span>
                <div style={{borderBottom:'1px solid rgba(255,255,255,0.55)', width:'108px', textAlign:'right', paddingBottom:'1px', fontFamily:'monospace', fontSize:'12px', fontWeight:'700', minHeight:'18px'}}>{fmt2(grand)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ════ BOTTOM STRIP: Bank+Terms | Receiver Stamp | Signature ════ */}
        <div style={{display:'flex', borderTop:B2, alignItems:'stretch'}}>

          {/* LEFT PANEL ~40%: Bank Details + Terms */}
          <div style={{flex:'0 0 40%', borderRight:B2, display:'flex', flexDirection:'column'}}>
            {/* Bank Details */}
            <div style={{padding:'8px 12px 8px 10px', borderBottom:'1px solid #CCC'}}>
              <div style={{display:'inline-block', background:N, color:'white', fontSize:'9.5px', fontWeight:'700', padding:'3px 10px', borderRadius:'3px', marginBottom:'7px'}}>Bank Details :</div>
              <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                {[
                  {lbl:'Bank A/c No.', val: company?.bankDetails?.accountNo||company?.bankDetails?.accountNumber||'', mono:true},
                  {lbl:'Bank Branch',  val: company?.bankDetails?.branch||''},
                  {lbl:'Bank IFSC',    val: company?.bankDetails?.ifsc||company?.bankDetails?.ifscCode||'', mono:true},
                ].map(({lbl,val,mono})=>(
                  <div key={lbl} style={{display:'flex', alignItems:'center', minHeight:'20px'}}>
                    <span style={{fontWeight:'700', color:N, width:'82px', fontSize:'9.5px', flexShrink:0}}>{lbl}</span>
                    <span style={{fontWeight:'700', color:N, margin:'0 5px', fontSize:'9.5px'}}>:</span>
                    <div style={{flex:1, borderBottom:UL, minHeight:'15px', paddingBottom:'1px', fontFamily:mono?'monospace':'inherit', fontWeight:mono?'700':'400', fontSize:'9.5px'}}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Terms */}
            <div style={{padding:'8px 12px 10px 10px', flex:1}}>
              <div style={{display:'inline-block', background:N, color:'white', fontSize:'9.5px', fontWeight:'700', padding:'3px 10px', borderRadius:'3px', marginBottom:'6px'}}>Terms and Conditions :</div>
              <p style={{fontSize:'7.9px', lineHeight:'1.5', color:'#444', margin:0, textAlign:'justify'}}>
                {company?.certificationText||'We hereby certify that my / our registration certificate under the Goods and Service Tax, is in force on the date on which the sale of goods specified in this Tax Invoice is made by me / us and that the transaction of sale covered by this Tax Invoice has been effected by me / us and that the sale has not been effected by any fraud, willful-misstatement or suppression of facts and that all the particulars shown in this Tax Invoice are true and correct. Tax, if any, payable on the said items paid or shall be paid.'}
              </p>
            </div>
          </div>

          {/* CENTER PANEL ~20%: empty — Receiver's Stamp label pinned near bottom */}
          <div style={{flex:'0 0 23%', borderRight:B2, position:'relative', minHeight:'25 0px'}}>
            <div style={{position:'absolute', bottom:'15px', left:0, right:0, textAlign:'center'}}>
              <span style={{fontSize:'9.5px', fontWeight:'600', color:'#444'}}>(Receiver's Stamp)</span>
            </div>
          </div>

          {/* RIGHT PANEL ~40%: Certification + For CORE PACK INDIA + Signature */}
          <div style={{flex:'0 0 40%', position:'relative', padding:'10px 14px 0'}}>
            {/* Top: certification text */}
            <div style={{fontSize:'9px', color:'#333', fontWeight:'500', lineHeight:'1.4', textAlign:'center', marginBottom:'8px'}}>
              Certified that the particulars given are true and correct.
            </div>
            {/* Orange company name */}
            <div style={{fontWeight:'800', color:O, fontSize:'11.5px', textTransform:'uppercase', letterSpacing:'0.3px', textAlign:'center'}}>
              For CORE PACK INDIA
            </div>
            {/* Signature line + label pinned near bottom */}
            <div style={{position:'absolute', bottom:'14px', left:0, right:0, display:'flex', flexDirection:'column', alignItems:'center'}}>
              <div style={{width:'170px', borderTop:'1px solid #888', marginBottom:'5px'}}/>
              <div style={{fontSize:'9.5px', fontWeight:'700', color:'#111'}}>Authorised Signatory</div>
            </div>
          </div>
        </div>

      </div>{/* end main box */}

      {/* bottom-right orange triangle */}
      <div style={{
        position:'absolute', bottom:0, right:0,
        width:0, height:0, borderStyle:'solid',
        borderWidth:'0 0 58px 58px',
        borderColor:'transparent transparent #F26522 transparent',
        pointerEvents:'none',
      }}/>

    </div>
  );
}
