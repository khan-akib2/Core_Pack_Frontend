import { Capacitor } from '@capacitor/core';
import { Printer } from '@capgo/capacitor-printer';

/**
 * Builds a clean, self-contained HTML document string from a target printable DOM element
 * for native Android PrintManager invocation.
 */
/**
 * Safely sanitizes a URL string for logging (strips query parameters and auth info).
 */
function safeSanitizeUrl(urlStr) {
  try {
    const parsed = new URL(urlStr, typeof window !== 'undefined' ? window.location.href : 'http://localhost');
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch (e) {
    return '[invalid url]';
  }
}

/**
 * Converts a live HTMLImageElement or image src into a self-contained Base64 data URL.
 * Attempts:
 * 1. Return as-is if already a data:image/ URL.
 * 2. Wait for image completion/decoding if element is loading in DOM.
 * 3. Draw onto offscreen Canvas from live loaded image (fast, preserves natural dimensions, offline-capable).
 * 4. Fallback: fetch() image resource and convert Blob to data URL via FileReader.
 * 5. Fallback: Create new Image() with crossOrigin = 'anonymous' and draw to Canvas.
 * 6. Ultimate Fallback: Return absolute resolved URL if all conversions fail.
 */
async function ensureImageDataUrl(imgElement) {
  if (!imgElement) return '';
  const rawSrc = imgElement.getAttribute('src') || imgElement.src;
  if (!rawSrc) return '';

  if (rawSrc.startsWith('data:image/')) {
    return rawSrc;
  }

  // 1. Wait for live DOM image readiness if needed
  if (!imgElement.complete) {
    try {
      if (typeof imgElement.decode === 'function') {
        await imgElement.decode();
      } else {
        await new Promise((resolve) => {
          if (imgElement.complete) return resolve();
          const cleanup = () => {
            imgElement.removeEventListener('load', onLoad);
            imgElement.removeEventListener('error', onError);
            resolve();
          };
          const onLoad = () => cleanup();
          const onError = () => cleanup();
          imgElement.addEventListener('load', onLoad);
          imgElement.addEventListener('error', onError);
          setTimeout(cleanup, 3000);
        });
      }
    } catch (e) {
      console.warn('[pdfUtils] Waiting for image decode/load warning:', e);
    }
  }

  const srcUrl = imgElement.src || rawSrc;

  // 2. Try offscreen canvas conversion from live DOM image (fastest & offline-safe)
  try {
    if (imgElement.complete && imgElement.naturalWidth > 0 && imgElement.naturalHeight > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = imgElement.naturalWidth;
      canvas.height = imgElement.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgElement, 0, 0);

      let mimeType = 'image/png';
      if (/\.jpe?g/i.test(srcUrl)) {
        mimeType = 'image/jpeg';
      } else if (/\.webp/i.test(srcUrl)) {
        mimeType = 'image/webp';
      } else if (/\.svg/i.test(srcUrl)) {
        mimeType = 'image/svg+xml';
      }

      const dataUrl = canvas.toDataURL(mimeType);
      if (dataUrl && dataUrl.startsWith('data:image/') && dataUrl !== 'data:,') {
        console.log(`[pdfUtils] Canvas converted image: ${safeSanitizeUrl(srcUrl)} (${canvas.width}x${canvas.height})`);
        return dataUrl;
      }
    }
  } catch (canvasErr) {
    console.warn(`[pdfUtils] Canvas conversion failed for ${safeSanitizeUrl(srcUrl)}:`, canvasErr);
  }

  // 3. Try fetch() fallback for remote/relative image URLs
  try {
    const fullUrl = new URL(rawSrc, window.location.href).href;
    console.log(`[pdfUtils] Fetching image for print embedding: ${safeSanitizeUrl(fullUrl)}`);
    const res = await fetch(fullUrl, { credentials: 'same-origin' });
    console.log(`[pdfUtils] Image fetch status: ${res.status}, content-type: ${res.headers.get('content-type')}`);
    
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.startsWith('image/') || contentType.includes('svg')) {
        const blob = await res.blob();
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('FileReader failed'));
          reader.readAsDataURL(blob);
        });
        if (dataUrl && dataUrl.startsWith('data:image/')) {
          console.log(`[pdfUtils] Fetch converted image: ${safeSanitizeUrl(fullUrl)}`);
          return dataUrl;
        }
      } else {
        console.warn(`[pdfUtils] Fetch response not image for ${safeSanitizeUrl(fullUrl)}: ${contentType}`);
      }
    }
  } catch (fetchErr) {
    console.warn(`[pdfUtils] Fetch failed for ${safeSanitizeUrl(rawSrc)}:`, fetchErr);
  }

  // 4. Try loading via new Image() object with crossOrigin anonymous
  try {
    const fullUrl = new URL(rawSrc, window.location.href).href;
    const dataUrl = await new Promise((resolve, reject) => {
      const tempImg = new Image();
      tempImg.crossOrigin = 'anonymous';
      tempImg.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = tempImg.naturalWidth || tempImg.width;
          canvas.height = tempImg.naturalHeight || tempImg.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(tempImg, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          reject(err);
        }
      };
      tempImg.onerror = (err) => reject(err);
      tempImg.src = fullUrl;
    });
    if (dataUrl && dataUrl.startsWith('data:image/')) {
      console.log(`[pdfUtils] New Image() converted: ${safeSanitizeUrl(fullUrl)}`);
      return dataUrl;
    }
  } catch (imgErr) {
    console.warn(`[pdfUtils] New Image() fallback failed:`, imgErr);
  }

  // 5. Ultimate fallback: return absolute URL
  try {
    return new URL(rawSrc, window.location.href).href;
  } catch (e) {
    return rawSrc;
  }
}

/**
 * Builds a clean, self-contained HTML document string from a target printable DOM element
 * for native Android PrintManager invocation, converting all image elements into inline Base64 data URLs.
 */
async function buildPrintHtml(element) {
  if (!element) return '';

  // Clone element to mutate image sources without altering live DOM
  const clone = element.cloneNode(true);

  // Process all image elements asynchronously
  const originalImgs = Array.from(element.querySelectorAll('img'));
  const clonedImgs = Array.from(clone.querySelectorAll('img'));

  await Promise.all(
    originalImgs.map(async (origImg, index) => {
      const dataUrl = await ensureImageDataUrl(origImg);
      if (dataUrl && clonedImgs[index]) {
        clonedImgs[index].src = dataUrl;
      }
    })
  );

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
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      background: #ffffff !important;
      color: #000000 !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 794px !important;
      min-width: 794px !important;
      max-width: 794px !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .printable-document {
      width: 794px !important;
      min-width: 794px !important;
      max-width: 794px !important;
      margin: 0 !important;
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
  <meta name="viewport" content="width=794, initial-scale=1.0">
  <style>
    @page { size: A4 portrait; margin: 0; }
    ${styles}
    ${defaultPrintCss}
  </style>
</head>
<body>
  ${clone.outerHTML}
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

    const printHtml = await buildPrintHtml(element);

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
