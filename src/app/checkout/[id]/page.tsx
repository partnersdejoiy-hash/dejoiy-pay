'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { HostedCheckout } from '@/components/checkout/HostedCheckout';
import { PaymentLink } from '@/lib/types/payment';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const params = useParams();
  const id = params?.id as string;

  const [linkData, setLinkData] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    if (id === 'demo') {
      setLinkData({
        id: 'demo_order_882',
        merchantId: 'mer_dejoiypay_01',
        environment: 'test',
        amount: 2499.0,
        currency: 'INR',
        description: 'DejoiY Developer Annual License (Team Tier)',
        customer: { name: 'Aakash Sharma', email: 'aakash.sharma@dejoiypay.com', phone: '9876543210' },
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        visitsCount: 1,
        qrPayload: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    fetch(`/api/v1/payment-links/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Payment link expired or not found');
        return res.json();
      })
      .then(data => {
        setLinkData(data.paymentLink);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-xs text-slate-500 font-mono animate-pulse">Loading DejoiY Pay Secure Checkout...</div>
      </div>
    );
  }

  if (error || !linkData) {
    return (
      <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Checkout Link Unavailable</h2>
          <p className="text-xs text-slate-500">{error || 'This link may have expired or already been paid.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top minimal brand */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between pb-4">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold tracking-tight text-base text-slate-900 dark:text-white">DEJOIY</span>
          <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">PAY</span>
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-slate-500">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>PCI-DSS Verified</span>
        </div>
      </div>

      {/* Main Hosted Checkout Interface */}
      <div className="flex-1 flex items-center justify-center">
        <HostedCheckout
          orderId={linkData.id}
          amount={linkData.amount}
          currency={linkData.currency}
          description={linkData.description}
          merchantName="DejoiY Technologies Pvt Ltd"
          customer={linkData.customer}
        />
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto w-full pt-4 text-center text-[10px] text-slate-400">
        Powered by DejoiY Pay &bull; NPCI UPI &bull; 256-Bit Financial Encryption
      </div>
    </div>
  );
}
