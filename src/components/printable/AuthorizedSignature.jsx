import React from 'react';

export function AuthorizedSignature({
  companyName = 'CORE PACK INDIA',
  title = 'Authorised Signatory',
  lineWidth = '220px',
  align = 'center'
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'right' ? 'flex-end' : 'center', width: '100%' }}>
      <div style={{ 
        fontWeight: '800', 
        color: '#E85C0D', 
        fontSize: '10.5px', 
        textTransform: 'uppercase', 
        letterSpacing: '0.2px', 
        textAlign: align,
        width: '100%' 
      }}>
        For {companyName}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: lineWidth, marginTop: '4px' }}>
        <img 
          src="/signature.png" 
          alt="Authorized Signature" 
          style={{ 
            height: '80px', 
            width: 'auto', 
            maxHeight: '90px',
            objectFit: 'contain', 
            marginBottom: '-6px',
            display: 'block'
          }} 
        />
        <div style={{ width: '100%', borderTop: '1px solid #666', paddingTop: '4px', textAlign: 'center', fontSize: '9.5px', fontWeight: '700', color: '#111' }}>
          {title}
        </div>
      </div>
    </div>
  );
}
