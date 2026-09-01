import React from 'react';
import './globals.css';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import { ModalProvider } from '@/components/providers/ModalProvider';
import { CapacitorInit } from '@/components/providers/CapacitorInit';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://corepackindia.com'),
  title: {
    template: '%s | Core Pack India',
    default: 'Core Pack India | Packaging Management Portal',
  },
  description: 'Production-grade Business Management System for Core Pack India. Streamline packaging, invoices, delivery challans, and product catalog management.',
  keywords: ['Core Pack India', 'Packaging Management', 'Business Portal', 'ERP', 'Invoicing', 'Corrugated Boxes', 'Wooden Pallets'],
  authors: [{ name: 'Core Pack India' }],
  creator: 'Core Pack India',
  publisher: 'Core Pack India',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Core Pack India | Business Portal',
    description: 'Enterprise Business Management System for Core Pack India',
    url: '/',
    siteName: 'Core Pack India Portal',
    images: [
      {
        url: '/branding/logo.png', // Assuming /logo.png exists as seen earlier
        width: 800,
        height: 600,
        alt: 'Core Pack India Logo',
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Core Pack India | Business Portal',
    description: 'Enterprise Business Management System for Core Pack India',
    images: ['/branding/logo.png'],
  },
  icons: {
    icon: '/icons/favicon.png',
    shortcut: '/icons/favicon.png',
    apple: '/icons/favicon.png',
  },
  robots: {
    index: true, // You might want this false if it's an internal portal, but user asked for SEO friendly
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 antialiased font-sans selection:bg-amber-500 selection:text-slate-950">
        <CapacitorInit />
        <ReactQueryProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
