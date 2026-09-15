import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { api } from '@/lib/api';

/**
 * Generates base64 PDF directly from a DOM element using html2pdf.js
 * Clones the element into an isolated fixed container at (0,0) to prevent
 * parent zoom/scale transforms, scroll offsets, or negative positioning bugs.
 * 
 * @param {HTMLElement} element - The DOM element to render (e.g. .printable-document)
 * @param {string} filename - Target filename (e.g. Invoice_INV-001.pdf)
 * @returns {Promise<string>} Base64 string without data URI prefix
 */
export async function generatePdfFromElement(element, filename = 'document.pdf') {
  if (!element) {
    throw new Error('Target element for PDF generation not found');
  }

  const html2pdf = (await import('html2pdf.js')).default;
  
  // 1. Create a clean top-level container appended directly to document.body
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '99999999';
  container.style.margin = '0';
  container.style.padding = '0';
  container.style.overflow = 'visible';

  // 2. Deep clone the target printable element
  const clone = element.cloneNode(true);
  
  // Reset any offscreen, opacity, zoom or positioning properties on the clone
  clone.style.position = 'relative';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.transform = 'none';
  clone.style.opacity = '1';
  clone.style.visibility = 'visible';
  clone.style.pointerEvents = 'auto';
  clone.style.margin = '0 auto';
  clone.style.display = 'block';

  // Remove utility classes that hide or offset elements
  clone.classList.remove('fixed', '-left-[9999px]', 'opacity-0', '-z-50', 'hidden');

  // 3. Normalize cloned DOM elements specifically for html2canvas rendering compatibility
  // A. Logo normalization (prevents html2canvas image stretch & transform scale distortion)
  const logoImg = clone.querySelector('img[src*="logo.png"]');
  if (logoImg) {
    logoImg.style.maxHeight = '88px';
    logoImg.style.maxWidth = '280px';
    logoImg.style.width = 'auto';
    logoImg.style.height = 'auto';
    logoImg.style.transform = 'none';
    logoImg.style.objectFit = 'contain';
    logoImg.style.objectPosition = 'center';
    logoImg.style.display = 'block';
    logoImg.style.margin = '0 auto';
  }

  // B. Contact Panel & Header height normalization (prevents header height expansion beyond 105px)
  const allDivs = clone.querySelectorAll('div');
  allDivs.forEach(div => {
    if (div.style && div.style.width === '380px') {
      div.style.padding = '6px 20px 6px 40px';
      div.style.gap = '4px';
      const spans = div.querySelectorAll('span');
      spans.forEach(span => {
        if (span.style.fontSize === '9px') span.style.fontSize = '8.5px';
        if (span.style.fontSize === '10.5px') span.style.fontSize = '9.5px';
        if (span.style.fontSize === '11px') span.style.fontSize = '10px';
        if (span.style.lineHeight) span.style.lineHeight = '1.25';
      });
    }
    if (div.style && (div.style.minHeight === '105px' || div.style.minHeight === '105px')) {
      div.style.height = '105px';
      div.style.maxHeight = '105px';
      div.style.overflow = 'hidden';
    }
    // C. Bottom-right border triangle replacement on clone (prevents 852px width miscalculation in html2canvas)
    if (div.style && div.style.borderWidth && div.style.borderWidth.includes('58px')) {
      const svgTri = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgTri.setAttribute('width', '58');
      svgTri.setAttribute('height', '58');
      svgTri.setAttribute('viewBox', '0 0 58 58');
      svgTri.style.position = 'absolute';
      svgTri.style.bottom = '0';
      svgTri.style.right = '0';
      svgTri.style.pointerEvents = 'none';
      svgTri.style.zIndex = '20';
      svgTri.innerHTML = '<polygon points="58,0 58,58 0,58" fill="#F26522" />';
      if (div.parentNode) {
        div.parentNode.replaceChild(svgTri, div);
      }
    }
  });

  container.appendChild(clone);
  document.body.appendChild(container);

  const opt = {
    margin: [0, 0, 0, 0],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      width: 794,
      windowWidth: 794,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    const pdfBase64 = await html2pdf().set(opt).from(clone).outputPdf('datauristring');
    const pureBase64 = pdfBase64.split(',')[1] || pdfBase64;
    return pureBase64;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Robust print/download handler for Android & Web.
 */
export async function printOrDownloadDocument({ type, documentId, title, elementQuery = '.printable-document', fallbackEndpoint }) {
  if (Capacitor.isNativePlatform()) {
    let pureBase64 = null;
    const safeTitle = (title || `${type}_${documentId}`).replace(/\s+/g, '_');
    const fileName = `${safeTitle}.pdf`;

    // Try client-side DOM render first for instant offline generation
    const element = document.querySelector(elementQuery);
    if (element) {
      try {
        pureBase64 = await generatePdfFromElement(element, fileName);
      } catch (err) {
        console.warn('[pdfUtils] Client PDF generation error, falling back to server:', err);
      }
    }

    // Fallback to backend API endpoint if element is missing or client render failed
    if (!pureBase64) {
      const endpointMap = {
        invoice: `/invoices/${documentId}/download/invoice?format=base64`,
        quotation: `/quotations/${documentId}/download/quotation?format=base64`,
        challan: `/challans/${documentId}/download/challan?format=base64`
      };
      const url = fallbackEndpoint || endpointMap[type];
      const res = await api.get(url);
      if (!res.data || !res.data.base64) {
        throw new Error('Failed to retrieve PDF data from server');
      }
      pureBase64 = res.data.base64;
    }

    // Save PDF to Android cache directory
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: pureBase64,
      directory: Directory.Cache
    });

    // Trigger Android FileProvider share/print intent
    try {
      await Share.share({
        title: title || 'Document',
        files: [savedFile.uri],
        dialogTitle: 'Print or Share Document'
      });
      return true;
    } catch (shareErr) {
      const msg = String(shareErr?.message || shareErr || '').toLowerCase();
      if (
        msg.includes('cancel') ||
        msg.includes('dismiss') ||
        msg.includes('user canceled') ||
        msg.includes('aborted')
      ) {
        console.log('[pdfUtils] Share dialog dismissed by user');
        return false;
      }
      throw shareErr;
    }
  }

  // Web Browser fallback
  window.print();
  return true;
}
