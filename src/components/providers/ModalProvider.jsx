'use client';

import React, { createContext, useContext, useState } from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const ModalContext = createContext({
  confirm: async () => false,
  showAlert: async () => {}
});

export function ModalProvider({ children }) {
  const [modalConfig, setModalConfig] = useState(null);

  const confirm = ({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger'
  }) => {
    return new Promise((resolve) => {
      setModalConfig({
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        variant,
        onConfirm: () => {
          setModalConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setModalConfig(null);
          resolve(false);
        }
      });
    });
  };

  const showAlert = ({
    title = 'Notice',
    message = '',
    variant = 'warning',
    buttonText = 'OK'
  }) => {
    return new Promise((resolve) => {
      setModalConfig({
        type: 'alert',
        title,
        message,
        variant,
        buttonText,
        onConfirm: () => {
          setModalConfig(null);
          resolve(true);
        }
      });
    });
  };

  return (
    <ModalContext.Provider value={{ confirm, showAlert }}>
      {children}
      {modalConfig && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-full shrink-0 ${
                  modalConfig.variant === 'danger'
                    ? 'bg-rose-100 text-rose-600'
                    : modalConfig.variant === 'success'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  {modalConfig.variant === 'success' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : modalConfig.variant === 'info' ? (
                    <Info className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">{modalConfig.title}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium pl-0.5">{modalConfig.message}</p>

            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100">
              {modalConfig.type === 'confirm' && (
                <Button variant="outline" size="sm" onClick={modalConfig.onCancel}>
                  {modalConfig.cancelText}
                </Button>
              )}
              <Button
                size="sm"
                className={
                  modalConfig.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : modalConfig.variant === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }
                onClick={modalConfig.onConfirm}
              >
                {modalConfig.type === 'confirm' ? modalConfig.confirmText : (modalConfig.buttonText || 'OK')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export const useCustomModal = () => useContext(ModalContext);
