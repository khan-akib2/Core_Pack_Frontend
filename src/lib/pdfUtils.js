import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { api } from '@/lib/api';

/**
 * Generates base64 PDF directly from a DOM element using html2pdf.js
 * @param {HTMLElement} element - The DOM element to render (e.g. .printable-document)
 * @param {string} filename - Target filename (e.g. Invoice_INV-001.pdf)
 * @returns {Promise<string>} Base64 string without data URI prefix
 */
export async function generatePdfFromElement(element, filename = 'document.pdf') {
  const html2pdf = (await import('html2pdf.js')).default;
  const opt = {
    margin: [5, 5, 5, 5],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const pdfBase64 = await html2pdf().set(opt).from(element).outputPdf('datauristring');
  const pureBase64 = pdfBase64.split(',')[1] || pdfBase64;
  return pureBase64;
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
    await Share.share({
      title: title || 'Document',
      files: [savedFile.uri],
      dialogTitle: 'Print or Share Document'
    });

    return true;
  }

  // Web Browser fallback
  window.print();
  return true;
}
