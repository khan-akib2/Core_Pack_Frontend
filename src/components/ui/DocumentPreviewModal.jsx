import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { X, Printer, Mail, MessageCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InvoicePrintable } from '@/components/printable/InvoicePrintable';
import { QuotationPrintable } from '@/components/printable/QuotationPrintable';
import { ChallanPrintable } from '@/components/printable/ChallanPrintable';
import { EmailDocumentModal } from '@/components/ui/EmailDocumentModal';
import { WhatsAppDocumentModal } from '@/components/ui/WhatsAppDocumentModal';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Capacitor } from '@capacitor/core';
import { useCustomModal } from '@/components/providers/ModalProvider';

export function DocumentPreviewModal({ isOpen, onClose, type, documentId }) {
  const { showAlert } = useCustomModal();
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const endpointMap = {
    invoice: `/invoices/${documentId}`,
    quotation: `/quotations/${documentId}`,
    challan: `/challans/${documentId}`
  };

  const { data: document, isLoading, error } = useQuery({
    queryKey: [type, documentId],
    queryFn: async () => {
      if (!documentId) return null;
      const res = await api.get(endpointMap[type]);
      return res.data.data;
    },
    enabled: isOpen && !!documentId
  });

  const { data: company } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const res = await api.get('/company');
      return res.data.data;
    },
    enabled: isOpen
  });

  const handlePrint = () => {
    if (Capacitor.isNativePlatform()) {
      showAlert({
        title: 'Native Print',
        message: 'Direct printing is not supported natively. Please use the WhatsApp or Email options, or print from the Web Dashboard.',
        variant: 'info'
      });
      return;
    }
    window.print();
  };

  const getDocProps = () => {
    if (!document) return {};
    switch (type) {
      case 'invoice':
        return {
          title: `Invoice ${document.invoiceNumber}`,
          typeLabel: 'Invoice',
          docNumber: document.invoiceNumber,
          customerName: document.customerSnapshot?.companyName || document.customerSnapshot?.name || '',
          email: document.customerSnapshot?.email || '',
          phone: document.customerSnapshot?.phone || '',
          customerId: document.customerId,
          emailApi: `/invoices/${documentId}/send-email/invoice`,
          whatsappApi: `/invoices/${documentId}/send-whatsapp/invoice`,
          detailsLink: `/invoices/${documentId}`
        };
      case 'quotation':
        return {
          title: `Quotation ${document.quoteNumber}`,
          typeLabel: 'Quotation',
          docNumber: document.quoteNumber,
          customerName: document.customerSnapshot?.companyName || document.customerSnapshot?.name || '',
          email: document.customerSnapshot?.email || '',
          phone: document.customerSnapshot?.phone || '',
          customerId: document.customerId,
          emailApi: `/quotations/${documentId}/send-email/quotation`,
          whatsappApi: `/quotations/${documentId}/send-whatsapp/quotation`,
          detailsLink: `/quotations/${documentId}`
        };
      case 'challan':
        return {
          title: `Challan ${document.challanNumber}`,
          typeLabel: 'Delivery Challan',
          docNumber: document.challanNumber,
          customerName: document.customerSnapshot?.companyName || document.customerSnapshot?.name || '',
          email: document.customerSnapshot?.email || '',
          phone: document.customerSnapshot?.phone || '',
          customerId: document.customerId,
          emailApi: `/challans/${documentId}/send-email/challan`,
          whatsappApi: `/challans/${documentId}/send-whatsapp/challan`,
          detailsLink: `/delivery-challans/${documentId}`
        };
      default:
        return {};
    }
  };

  const docProps = getDocProps();

  return (
    <>
    <AnimatePresence>
      {isOpen && (
      <div key="modal-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 print:hidden">
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          key="modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{docProps.title || 'Loading...'}</h2>
              {docProps.customerName && <p className="text-xs text-slate-500 font-medium">{docProps.customerName}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <style>{`
            .preview-zoom { transform: scale(0.38); transform-origin: top center; margin-bottom: -695px; }
            @media (min-width: 360px) { .preview-zoom { transform: scale(0.42); margin-bottom: -650px; } }
            @media (min-width: 400px) { .preview-zoom { transform: scale(0.46); margin-bottom: -605px; } }
            @media (min-width: 480px) { .preview-zoom { transform: scale(0.55); margin-bottom: -504px; } }
            @media (min-width: 640px) { .preview-zoom { transform: scale(0.75); margin-bottom: -280px; } }
            @media (min-width: 768px) { .preview-zoom { transform: scale(0.85); margin-bottom: -168px; } }
            @media (min-width: 1024px) { .preview-zoom { transform: scale(0.95); margin-bottom: -56px; } }
          `}</style>
          {/* Document Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-200/50 p-2 sm:p-6 flex justify-center items-start">
            {isLoading || !company ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-slate-500">Loading document...</p>
              </div>
            ) : !document || error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-rose-500 mb-2">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <p className="text-sm text-slate-700 font-medium mb-1">Failed to load document</p>
                <p className="text-xs text-slate-500 mb-4 text-center max-w-xs">{error?.response?.data?.message || error?.message || 'The document could not be found or you are offline.'}</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : (
              <div className="preview-zoom bg-white shadow-lg border border-slate-200 origin-top">
                {type === 'invoice' && <InvoicePrintable invoice={document} company={company} />}
                {type === 'quotation' && <QuotationPrintable quotation={document} company={company} />}
                {type === 'challan' && <ChallanPrintable challan={document} company={company} />}
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="p-4 border-t border-slate-100 bg-white shrink-0 grid grid-cols-2 sm:flex sm:flex-row gap-2 items-center justify-between">
            <div className="col-span-2 sm:col-span-1 grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setIsWhatsAppOpen(true)} className="w-full sm:w-auto text-green-600 border-green-200 hover:bg-green-50" disabled={!document}>
                <MessageCircle className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">WhatsApp</span>
              </Button>
              <Button variant="outline" onClick={() => setIsEmailOpen(true)} className="w-full sm:w-auto text-indigo-600 border-indigo-200 hover:bg-indigo-50" disabled={!document}>
                <Mail className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Email</span>
              </Button>
              <Button variant="outline" onClick={handlePrint} className="col-span-2 sm:col-span-1 w-full sm:w-auto" disabled={!document}>
                <Printer className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Print</span>
              </Button>
            </div>
            {docProps.detailsLink && (
              <div className="col-span-2 sm:col-span-1 w-full sm:w-auto mt-2 sm:mt-0">
                <Link href={docProps.detailsLink} onClick={onClose}>
                  <Button className="w-full sm:w-auto">
                    Open Full Details <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
      {document && (
        <>
          <EmailDocumentModal
            isOpen={isEmailOpen}
            onClose={() => setIsEmailOpen(false)}
            documentType={docProps.typeLabel}
            documentId={documentId}
            documentNumber={docProps.docNumber}
            defaultEmail={docProps.email}
            defaultCustomerId={docProps.customerId}
            customerName={docProps.customerName}
            apiEndpoint={docProps.emailApi}
          />

          <WhatsAppDocumentModal
            isOpen={isWhatsAppOpen}
            onClose={() => setIsWhatsAppOpen(false)}
            documentType={docProps.typeLabel}
            documentId={documentId}
            documentNumber={docProps.docNumber}
            defaultPhone={docProps.phone}
            defaultCustomerId={docProps.customerId}
            customerName={docProps.customerName}
            apiEndpoint={docProps.whatsappApi}
          />
        </>
      )}
    </>
  );
}
