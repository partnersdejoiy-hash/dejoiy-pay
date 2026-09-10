import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DejoiY Pay — Enterprise Payment Gateway & Financial Platform',
  description: 'Unified multi-provider payment ecosystem supporting Direct UPI, Razorpay, Stripe, Paytm, and Amazon Pay.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
