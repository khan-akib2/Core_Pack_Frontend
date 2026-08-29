import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Send, Loader2 } from 'lucide-react';
import { useCustomModal } from '@/components/providers/ModalProvider';

export function EmailDocumentModal({
  isOpen,
  onClose,
  documentType,
  documentId,
  documentNumber,
  defaultEmail,
  defaultCustomerId,
  customerName,
  apiEndpoint
}) {
  const { showAlert } = useCustomModal();
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState(`${documentType.toUpperCase()} - ${documentNumber}`);
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const { data: customers } = useQuery({
    queryKey: ['customersList'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data.data;
    },
    enabled: isOpen
  });

  React.useEffect(() => {
    if (isOpen && customers && !hasInitialized) {
      let initialEmail = defaultEmail;
      let finalName = customerName;

      if (defaultCustomerId) {
        const found = customers.find(c => String(c._id) === String(defaultCustomerId));
        if (found) {
          if (!initialEmail && found.email) {
            initialEmail = found.email;
          }
          if (!finalName && (found.companyName || found.name)) {
            finalName = found.companyName || found.name;
          }
        }
      }

      setToEmail(initialEmail || '');
      const greetingName = finalName ? finalName : 'Valued Customer';
      setMessage(`Dear ${greetingName},\n\nPlease find attached your ${documentType} (${documentNumber}) for your reference.\n\nShould you have any questions or require further assistance, please do not hesitate to reach out to us.\n\nBest regards,\nCorePack Team`);
      setHasInitialized(true);
    }
  }, [isOpen, customers, defaultEmail, defaultCustomerId, customerName, documentType, documentNumber, hasInitialized]);

  React.useEffect(() => {
    if (!isOpen) {
      setHasInitialized(false);
    }
  }, [isOpen]);

  const sendEmailMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(apiEndpoint, payload);
      return res.data;
    },
    onSuccess: () => {
      showAlert({
        title: 'Success',
        message: 'Email sent successfully!',
        variant: 'success'
      });
      onClose();
    },
    onError: (err) => {
      showAlert({
        title: 'Email Failed',
        message: err.response?.data?.message || err.message || 'Failed to send email.',
        variant: 'danger'
      });
    }
  });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!toEmail) return;

    try {
      setIsGenerating(true);
      sendEmailMutation.mutate({ toEmail, subject, message });
    } catch (error) {
      console.error('Send error:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to initiate send request. ' + error.message,
        variant: 'danger'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const isWorking = isGenerating || sendEmailMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Send {documentType} via Email</h3>
          {!isWorking && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <Input
            label="Recipient Email"
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            required
            disabled={isWorking}
          />
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            disabled={isWorking}
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Message
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500 font-normal leading-relaxed"
              required
              disabled={isWorking}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isWorking}>Cancel</Button>
            <Button type="submit" disabled={isWorking} className="flex items-center gap-2">
              {isWorking ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Email</>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
