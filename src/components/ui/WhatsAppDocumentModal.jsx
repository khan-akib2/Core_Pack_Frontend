import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { X, Send, Loader2, ChevronDown, Search, Plus, UserCheck } from 'lucide-react';
import { useCustomModal } from '@/components/providers/ModalProvider';
import { Capacitor } from '@capacitor/core';
import { Contacts } from '@capacitor-community/contacts';
export function WhatsAppDocumentModal({
  isOpen,
  onClose,
  documentType,
  documentId,
  documentNumber,
  defaultPhone,
  defaultCustomerId,
  customerName,
  apiEndpoint
}) {
  const { showAlert } = useCustomModal();
  const [recipients, setRecipients] = useState([]);
  const [customPhoneInput, setCustomPhoneInput] = useState('');
  const greetingName = customerName ? customerName : 'Valued Customer';
  const [message, setMessage] = useState(`Dear ${greetingName},\n\nPlease find attached your ${documentType} (${documentNumber}) for your reference.\n\nShould you have any questions or require further assistance, please do not hesitate to reach out to us.\n\nBest regards,\nCorePack Team`);
  const [isGenerating, setIsGenerating] = useState(false);

  const [hasInitialized, setHasInitialized] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const { data: customers } = useQuery({
    queryKey: ['customersList'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data.data;
    }
  });

  const normalizePhone = (num) => {
    if (!num) return '';
    return num.replace(/[^\d]/g, '');
  };

  const addRecipient = (phone, name = '') => {
    if (!phone || !phone.trim()) return;
    const cleanPhone = phone.trim();
    const normalized = normalizePhone(cleanPhone);
    if (!normalized) return;

    // Check duplicate
    if (recipients.some(r => normalizePhone(r.phone) === normalized)) {
      showAlert({
        title: 'Already Added',
        message: `The number ${cleanPhone} is already in the recipient list.`,
        variant: 'warning'
      });
      return;
    }

    setRecipients(prev => [...prev, { phone: cleanPhone, name: name || cleanPhone }]);
    setCustomPhoneInput('');
  };

  const removeRecipient = (indexToRemove) => {
    setRecipients(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const pickContact = async () => {
    try {
      if (!Capacitor.isNativePlatform()) return;
      
      const permissions = await Contacts.checkPermissions();
      if (permissions.contacts !== 'granted') {
        const req = await Contacts.requestPermissions();
        if (req.contacts !== 'granted') {
          showAlert({
            title: 'Permission Denied',
            message: 'Contact access is required to pick a phone number.',
            variant: 'warning'
          });
          return;
        }
      }

      const result = await Contacts.pickContact({ projection: { name: true, phones: true } });
      if (result.contact) {
        const contact = result.contact;
        const phone = contact.phones?.[0]?.number;
        const name = contact.name?.display;
        if (phone) {
          addRecipient(phone, name || 'Phone Contact');
        } else {
          showAlert({
            title: 'No Phone Number',
            message: 'The selected contact does not have a phone number.',
            variant: 'warning'
          });
        }
      }
    } catch (e) {
      console.error('Contact picker error:', e);
    }
  };

  useEffect(() => {
    if (isOpen && customers && !hasInitialized) {
      let initialPhone = defaultPhone;
      let finalName = customerName;

      if (defaultCustomerId) {
        const found = customers.find(c => String(c._id) === String(defaultCustomerId));
        if (found) {
          if (!initialPhone && found.phone) {
            initialPhone = found.phone;
          }
          if (!finalName && (found.companyName || found.name)) {
            finalName = found.companyName || found.name;
          }
        }
      }
      
      const greetingName = finalName ? finalName : 'Valued Customer';
      setMessage(`Dear ${greetingName},\n\nPlease find attached your ${documentType} (${documentNumber}) for your reference.\n\nShould you have any questions or require further assistance, please do not hesitate to reach out to us.\n\nBest regards,\nCorePack Team`);
      
      if (initialPhone) {
        setRecipients([{ phone: initialPhone, name: finalName || 'Primary Customer' }]);
      } else {
        setRecipients([]);
      }

      setHasInitialized(true);
    }
  }, [isOpen, customers, defaultPhone, defaultCustomerId, customerName, documentType, documentNumber, hasInitialized]);

  useEffect(() => {
    if (!isOpen) {
      setHasInitialized(false);
      setIsDropdownOpen(false);
      setSearchQuery('');
      setCustomPhoneInput('');
      setRecipients([]);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sendWhatsAppMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post(apiEndpoint, payload);
      return res.data;
    },
    onSuccess: (data) => {
      showAlert({
        title: 'Success',
        message: data.message || 'WhatsApp message(s) sent successfully!',
        variant: 'success'
      });
      onClose();
    },
    onError: (err) => {
      showAlert({
        title: 'Delivery Failed',
        message: err.response?.data?.message || err.message || 'Failed to send WhatsApp message.',
        variant: 'danger'
      });
    }
  });

  const handleSend = async (e) => {
    e.preventDefault();
    const toNumbers = recipients.map(r => r.phone).filter(Boolean);
    if (toNumbers.length === 0) {
      showAlert({
        title: 'No Recipients',
        message: 'Please add at least one recipient WhatsApp number.',
        variant: 'warning'
      });
      return;
    }

    try {
      setIsGenerating(true);
      sendWhatsAppMutation.mutate({
        toNumbers,
        toNumber: toNumbers[0], // fallback for single-recipient APIs
        message
      });
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

  const isWorking = isGenerating || sendWhatsAppMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Send {documentType} via WhatsApp</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select single or multiple recipients for instant PDF delivery</p>
          </div>
          {!isWorking && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          
          {/* Selected Recipients Container */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Selected Recipients ({recipients.length})
            </label>

            {recipients.length === 0 ? (
              <div className="p-3 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                No recipients selected. Add a customer or enter a number below.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl max-h-32 overflow-y-auto">
                {recipients.map((rcp, idx) => (
                  <div
                    key={`${rcp.phone}-${idx}`}
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 shadow-xs px-2.5 py-1 rounded-lg text-xs font-medium text-slate-800"
                  >
                    <span className="truncate max-w-[140px]">{rcp.name || rcp.phone}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({rcp.phone})</span>
                    {!isWorking && (
                      <button
                        type="button"
                        onClick={() => removeRecipient(idx)}
                        className="text-slate-400 hover:text-rose-600 rounded-full p-0.5 transition-colors"
                        title="Remove recipient"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Recipient Controls */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Add Recipient (Select Saved or Enter Manual)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-green-500 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  value={customPhoneInput}
                  onChange={(e) => setCustomPhoneInput(e.target.value)}
                  placeholder="Select saved customer or type phone..."
                  disabled={isWorking}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRecipient(customPhoneInput);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => !isWorking && setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isWorking}
                  className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Search saved customers"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {customPhoneInput.trim() && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addRecipient(customPhoneInput)}
                  disabled={isWorking}
                  className="flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add
                </Button>
              )}
            </div>

            {Capacitor.isNativePlatform() && (
              <Button
                type="button"
                variant="outline"
                onClick={pickContact}
                disabled={isWorking}
                className="w-full mt-2 flex items-center justify-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                📱 Select from phone contacts
              </Button>
            )}

            {/* Saved Customers Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-64 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search customer or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-300"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-1">
                  {customers
                    ?.filter(c => {
                      const q = searchQuery.toLowerCase();
                      return (c.name?.toLowerCase().includes(q) || c.companyName?.toLowerCase().includes(q) || c.phone?.includes(q));
                    })
                    .map(c => {
                      const isAdded = recipients.some(r => normalizePhone(r.phone) === normalizePhone(c.phone));
                      return (
                        <button
                          key={c._id}
                          type="button"
                          disabled={isAdded || !c.phone}
                          onClick={() => {
                            if (c.phone) {
                              addRecipient(c.phone, c.companyName || c.name);
                            }
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-2 transition-colors ${
                            isAdded ? 'bg-slate-50 opacity-60 cursor-not-allowed' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                              {c.companyName || c.name}
                              {String(c._id) === String(defaultCustomerId) && (
                                <span className="text-[10px] font-semibold tracking-wider text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase">Default</span>
                              )}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">{c.phone || 'No phone saved'}</span>
                          </div>
                          {isAdded && (
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" /> Added
                            </span>
                          )}
                        </button>
                      );
                    })}
                  {customers?.filter(c => {
                    const q = searchQuery.toLowerCase();
                    return (c.name?.toLowerCase().includes(q) || c.companyName?.toLowerCase().includes(q) || c.phone?.includes(q));
                  }).length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400">No matching customers found.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Message Caption
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-green-500 font-normal leading-relaxed"
              required
              disabled={isWorking}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isWorking}>Cancel</Button>
            <Button type="submit" disabled={isWorking || recipients.length === 0} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
              {isWorking ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> {recipients.length > 1 ? `Send to ${recipients.length} recipients` : 'Send WhatsApp'}</>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
