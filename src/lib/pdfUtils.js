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
