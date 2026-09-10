'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatINR } from '@/lib/utils';
import { QrCode, Image as ImageIcon, Flashlight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function ConsumerScanPage() {
  const router = useRouter();
  const [torchOn, setTorchOn] = useState(false);
  const [scannedPayload, setScannedPayload] = useState<any>(null);

  // Payment confirmation form state
  const [payAmount, setPayAmount] = useState('');
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  const simulateScan = (merchantName: string, vpa: string, defaultAmount?: number) => {
    setScannedPayload({
      merchantName,
      vpa,
      amount: defaultAmount || 250,
    });
    setPayAmount(defaultAmount ? defaultAmount.toString() : '250');
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) return;

    try {
      setIsProcessing(true);
      const res = await fetch('/api/v1/consumer/send-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientVpaOrPhone: scannedPayload.vpa,
          recipientName: scannedPayload.merchantName,
          amount: parseFloat(payAmount),
          upiPin: pin,
          note: `QR Scan at ${scannedPayload.merchantName}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowPinModal(false);
        setSuccess({
          amount: parseFloat(payAmount),
          merchantName: scannedPayload.merchantName,
          rrn: data.rrn,
        });
      } else {
        alert(data.error || 'Payment failed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-lg space-y-4 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Paid to {success.merchantName}</h2>
        <div className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">
          {formatINR(success.amount)}
        </div>
        <p className="text-xs text-slate-400 font-mono">UPI Ref (RRN): {success.rrn}</p>

        <Button onClick={() => router.push('/consumer')} className="w-full text-xs mt-4">
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scanner Viewfinder Box */}
      <div className="relative rounded-2xl bg-slate-950 overflow-hidden shadow-2xl aspect-[4/5] flex flex-col items-center justify-between p-6 text-white border border-slate-800">
        {/* Top Controls */}
        <div className="w-full flex items-center justify-between z-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Scan any QR Code
          </span>
          <button
            onClick={() => setTorchOn(!torchOn)}
            className={`p-2 rounded-full border border-slate-700 transition-colors ${
              torchOn ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-white'
            }`}
          >
            <Flashlight className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Target Frame */}
        <div className="w-64 h-64 border-2 border-emerald-500/80 rounded-2xl relative flex items-center justify-center">
          {/* Laser scanning beam */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#10b981] animate-bounce" />

          {/* Corner Guides */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white" />

          <p className="text-[11px] text-slate-400 text-center px-4">
            Align QR Code inside this frame to scan
          </p>
        </div>

        {/* Bottom Helper */}
        <div className="w-full text-center z-10 space-y-2">
          <div className="inline-flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NPCI Bharat QR &bull; Paytm &bull; PhonePe &bull; GPay</span>
          </div>
        </div>
      </div>

      {/* Instant Scan Simulation Demos */}
      <Card className="p-4 space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Quick Demo QR Scans:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateScan('DejoiY Storefront Billing', 'dejoiypay.merchant@icici', 350)}
            className="text-xs justify-start"
          >
            <QrCode className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Store Counter (₹350)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => simulateScan('Cafe Coffee Day Kiosk', 'ccd.billing@hdfcbank', 180)}
            className="text-xs justify-start"
          >
            <QrCode className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Coffee Day (₹180)
          </Button>
        </div>
      </Card>

      {/* Payment Confirmation Drawer / Sheet */}
      {scannedPayload && (
        <Card className="p-5 space-y-4 animate-in slide-in-from-bottom-4 border-emerald-500/40">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {scannedPayload.merchantName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">{scannedPayload.vpa}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Verified Merchant
            </span>
          </div>

          <Input
            label="Amount to Pay"
            type="number"
            step="0.01"
            prefixText="₹"
            value={payAmount}
            onChange={e => setPayAmount(e.target.value)}
            required
          />

          <Button
            onClick={() => setShowPinModal(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Pay {formatINR(parseFloat(payAmount) || 0)} &rarr;
          </Button>
        </Card>
      )}

      {/* 6-Digit PIN Modal */}
      <Modal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        title="Enter UPI PIN"
        maxWidth="sm"
      >
        <form onSubmit={handleConfirmPayment} className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-700 dark:text-slate-300">
            <Lock className="w-6 h-6" />
          </div>

          <p className="text-xs text-slate-500">
            Authorizing payment of <span className="font-bold text-slate-900 dark:text-slate-100">{formatINR(parseFloat(payAmount) || 0)}</span>
          </p>

          <input
            type="password"
            maxLength={6}
            autoFocus
            placeholder="••••••"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-48 mx-auto text-center font-mono text-2xl tracking-widest py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            required
          />

          <div className="flex space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowPinModal(false)} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" isLoading={isProcessing} className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white">
              Confirm & Pay
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
