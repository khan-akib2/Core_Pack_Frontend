import { Capacitor } from '@capacitor/core';
import { Printer } from '@capgo/capacitor-printer';

/**
 * Builds a clean, self-contained HTML document string from a target printable DOM element
 * for native Android PrintManager invocation.
 */
function buildPrintHtml(element) {
  if (!element) return '';

  let styles = '';
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        styles += rules.map(r => r.cssText).join('\n');
      } catch (e) {
        // Ignore cross-origin stylesheet read restrictions
      }
    }
  } catch (e) {
    console.warn('[pdfUtils] Error reading stylesheets for native print:', e);
  }

  const defaultPrintCss = `
    @page { margin: 0; size: A4 portrait; }
    html, body {
      background: #ffffff !important;
      color: #000000 !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .printable-document {
      width: 794px !important;
      margin: 0 auto !important;
      padding: 0 !important;
      box-shadow: none !important;
      border: none !important;
      background: #ffffff !important;
      visibility: visible !important;
      display: block !important;
    }
    .no-print, .print\\:hidden { display: none !important; }
  `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${styles}
    ${defaultPrintCss}
  </style>
</head>
<body>
  ${element.outerHTML}
</body>
</html>`;
}

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
 * Native Android & Web print handler.
 * - On Android Native: Triggers Android PrintManager via @capgo/capacitor-printer (Printer.printHtml)
 * - On Web Browser: Invokes standard window.print()
 */
export async function printOrDownloadDocument({ type, documentId, title, elementQuery = '.printable-document' }) {
  if (Capacitor.isNativePlatform()) {
    const safeTitle = (title || `${type}_${documentId}`).replace(/\s+/g, '_');
    const element = document.querySelector(elementQuery);

    if (!element) {
      throw new Error('Printable document element not found on page');
    }

    const printHtml = buildPrintHtml(element);

    // Invoke Android native PrintManager via @capgo/capacitor-printer
    await Printer.printHtml({
      name: safeTitle,
      html: printHtml
    });

    return true;
  }

  // Web Browser fallback
  window.print();
  return true;
}
