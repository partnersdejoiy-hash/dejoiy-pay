'use client';
import React, { useState } from 'react';
import { formatINR } from '@/lib/utils';
import { QrDisplay } from '@/components/qr/QrDisplay';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { buildUpiUri } from '@/lib/upi/spec';
import { Delete, Volume2, CheckCircle2, RotateCcw, ArrowLeft } from 'lucide-react';

export default function MerchantPosPage() {
  const [amountStr, setAmountStr] = useState('');
  const [activeQrPayload, setActiveQrPayload] = useState<string | null>(null);
  const [posState, setPosState] = useState<'KEYPAD' | 'QR_TERMINAL' | 'PAID'>('KEYPAD');
  const [paidRrn, setPaidRrn] = useState('');

  const handleKeypadPress = (key: string) => {
    if (key === 'C') {
      setAmountStr('');
      return;
    }
    if (key === 'DEL') {
      setAmountStr(prev => prev.slice(0, -1));
      return;
    }
    if (amountStr.length >= 7) return; // Cap length
    setAmountStr(prev => prev + key);
  };

  const handleGenerateTerminalQr = () => {
    const num = parseFloat(amountStr);
    if (isNaN(num) || num <= 0) return;

    const uri = buildUpiUri({
      pa: 'dejoiypay.merchant@icici',
      pn: 'DejoiY Technologies',
      mc: '6012',
      am: num,
      tr: `POS_${Date.now()}`,
      tn: 'Store Billing Counter',
      cu: 'INR',
      mode: '01',
    });

    setActiveQrPayload(uri);
    setPosState('QR_TERMINAL');
  };

  const simulateCustomerPayment = () => {
    const num = parseFloat(amountStr) || 100;
    const rrn = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    setPaidRrn(rrn);
    setPosState('PAID');

    // Voice alert announcement
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`DejoiY Pay par ${num} rupaye prapt hue.`);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const resetPos = () => {
    setAmountStr('');
    setActiveQrPayload(null);
    setPosState('KEYPAD');
  };

  if (posState === 'PAID') {
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl space-y-6 animate-in zoom-in-95">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Payment Received!</h2>
          <p className="text-xs text-slate-500">DejoiY Soundbox announced confirmation</p>
        </div>

        <div className="text-4xl font-extrabold font-mono text-emerald-600">
          {formatINR(parseFloat(amountStr))}
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs font-mono text-slate-600 dark:text-slate-300">
          UPI RRN: {paidRrn}
        </div>

        <Button onClick={resetPos} className="w-full h-12 text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl">
          Next Customer (New Bill)
        </Button>
      </div>
    );
  }

  if (posState === 'QR_TERMINAL' && activeQrPayload) {
    return (
      <div className="max-w-md mx-auto space-y-4 animate-in fade-in">
        <button
          onClick={() => setPosState('KEYPAD')}
          className="flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Billing Keypad
        </button>

        <QrDisplay
          payload={activeQrPayload}
          title="Scan to Pay at Counter"
          amount={parseFloat(amountStr)}
          merchantName="DejoiY Storefront POS"
          showSoundboxTest={false}
        />

        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-center space-y-2">
          <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            Waiting for customer to scan and authorize...
          </p>
          <Button
            size="sm"
            onClick={simulateCustomerPayment}
            className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            Simulate Customer Payment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mobile POS Counter Terminal</h1>
        <p className="text-xs text-slate-500">Fast counter checkout calculator with audio alert</p>
      </div>

      {/* Bill Display Screen */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 text-right shadow-lg border border-slate-800">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Billing Amount</span>
        <div className="text-4xl font-extrabold font-mono text-emerald-400 mt-1">
          ₹ {amountStr || '0'}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map(k => (
          <button
            key={k}
            type="button"
            onClick={() => handleKeypadPress(k)}
            className={`h-16 rounded-xl font-bold text-xl transition-all active:scale-95 shadow-sm border ${
              k === 'C'
                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                : k === 'DEL'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {k === 'DEL' ? <Delete className="w-5 h-5 mx-auto" /> : k}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <Button
        disabled={!amountStr || parseFloat(amountStr) <= 0}
        onClick={handleGenerateTerminalQr}
        className="w-full h-14 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md"
      >
        Show Customer QR &rarr;
      </Button>
    </div>
  );
}
