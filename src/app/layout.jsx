import React from 'react';
import './globals.css';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import { ModalProvider } from '@/components/providers/ModalProvider';

export const metadata = {
  title: 'Core Pack India | Packaging Management Portal',
  description: 'Production-grade Business Management System for Core Pack India',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans selection:bg-amber-500 selection:text-slate-950">
        <ReactQueryProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
